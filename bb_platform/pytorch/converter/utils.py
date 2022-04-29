import os
import h5py
import json
import shutil
import pandas as pd
import numpy as np
from pathlib import Path

from django.conf import settings

logger = settings.LOGGER


def remove_dirs(instance):
    """
        Remove the instance's directory accordingly
    """
    filepath = Path(instance.filepath.path)
    file_folder = filepath.parent
    try:
        shutil.rmtree(file_folder)
        logger.info(f'Removed {file_folder}')
    except:
        logger.debug(f'Remove dir error: {e}')
        logger.debug(f'Directory: {file_folder}')


def load_json(filepath):
    """
        Load json file
    """
    with open(filepath, 'r') as f:
        data = json.load(f)

    return data


def partition_data(meta_df, label_class_map, mode, train_ratio=0.8):
    """
        Partition data into training and testing based on per class
    """
    # import pdb
    # pdb.set_trace()
    for k, v in label_class_map.items():
        if mode == 'MATLAB':
            class_id = k
            class_instance_ids = meta_df.loc[meta_df['category']
                                             == k, 'id'].to_numpy()
        else:
            class_id = v
            class_instance_ids = meta_df.loc[meta_df['class_id']
                                             == class_id, 'id'].to_numpy()
        num_instances = len(class_instance_ids)
        np.random.shuffle(class_instance_ids)
        train_ids = class_instance_ids[:int(train_ratio*num_instances)]
        test_ids = class_instance_ids[int(train_ratio*num_instances):]
        meta_df.loc[train_ids, 'subset'] = 'train'
        meta_df.loc[test_ids, 'subset'] = 'test'

    return meta_df


def crop_image_patch(row_df, subim_x, IMG_WIDTH=224, IMG_HEIGHT=224):
    """
        Crop image patches from original leaf disc image
    """
    subindex = row_df['subindex']
    category = row_df['category']
    coord_x = ((subindex - 1) % subim_x) * IMG_WIDTH + 1
    coord_y = ((subindex - 1) // subim_x) * IMG_WIDTH + 1
    box = (coord_x, coord_y, coord_x + IMG_WIDTH, coord_y + IMG_HEIGHT)

    return box, category


def save_hdf5(filepath, meta_df, image_data, image_labels, mode, datetime):
    """
        Save data to HDF5 file
    Args:
        filepath:
        meta_df:
        image_data, image_labels:     
        mode:                         Training dataset or testing dataset
        datetime:
    """
    dataset = 'train' if mode == 'train' else 'test'
    with h5py.File(filepath, 'w') as f:
        ids = meta_df.loc[meta_df['subset'] == dataset, 'id'].values.tolist()
        f.create_dataset(name='images', data=image_data[ids, :, :, :])
        f.create_dataset(name='labels', data=image_labels[ids, :])
        f.attrs['year'] = datetime.year
        f.attrs['month'] = datetime.month

    logger.info('HDF5 data file is saved as {}.'.format(filepath))
