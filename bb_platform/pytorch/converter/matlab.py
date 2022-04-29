import os
import json
import argparse
import pandas as pd
from pathlib import Path
import numpy as np

from PIL import Image
from datetime import datetime

from pytorch.converter.utils import load_json, crop_image_patch, partition_data, save_hdf5, remove_dirs
from pytorch.config import (IMG_EXT, IMG_HEIGHT, IMG_WIDTH,
                            IMG_ORI_EXT, CHANNELS, LABEL_CLASS_MAP)

from django.conf import settings


logger = settings.LOGGER


def converter(path, dirs=[], instance=None):
    """
    Args:
        For instance, if there are three directories Tray1, Tray2, and Tray3 under the following path 
        (/media/datasets/user1/dataset1/extract/Training/), then path and dirs should be

        path:         /media/datasets/user1/dataset1/extract/Training/
        dirs:         [Tray1, Tray2, Tray3]
        instance:     A newly created instance
    """
    try:
        logger.info('Run MATLAB converter')

        main_folder = Path(path)
        sub_folders = []
        for subfolder in dirs:
            sub_folders.append(main_folder / subfolder)
        metadata_filepath = main_folder / 'metadata.csv'
        train_data_filepath = main_folder / 'train_set.hdf5'
        test_data_filepath = main_folder / 'test_set.hdf5'

        image_data = image_labels = None
        meta_df = None
        infected = clear = 0
        total_samples = 0

        for idx, sub_folder in enumerate(sub_folders):
            image_folder = sub_folder / 'images'
            csv_filepath = sub_folder / 'metadata.csv'

            sub_meta_df = pd.read_csv(csv_filepath)
            num_samples = len(sub_meta_df)
            sub_meta_df['id'] = np.arange(
                total_samples, total_samples + num_samples)
            sub_meta_df['subset'] = 'NA'
            total_samples += num_samples

            # Numpy arrays for data and labels
            # Data array is arranged as S x H x W x C, S: sample number, C: channel number
            cur_image_data = np.ndarray(shape=(num_samples, IMG_WIDTH,
                                               IMG_HEIGHT, CHANNELS), dtype=np.uint8)
            cur_image_labels = np.zeros(shape=(num_samples, 1), dtype=np.uint8)

            meta_by_imagename = sub_meta_df.groupby('imagename')
            for filename, group in meta_by_imagename:
                image_filepath = str(image_folder / filename) + IMG_ORI_EXT
                img = Image.open(image_filepath)
                width, height = img.size
                subim_x = width // IMG_WIDTH
                subim_y = height // IMG_HEIGHT
                for i, row_df in group.iterrows():
                    box, category = crop_image_patch(row_df, subim_x)
                    subim = img.crop(box)
                    subim_arr = np.asarray(subim)
                    cur_image_data[i, :, :, :] = subim_arr
                    cur_image_labels[i] = LABEL_CLASS_MAP[category]
                    # Count class distribution
                    if cur_image_labels[i] == 1:
                        infected += 1
                    else:
                        clear += 1

            if idx == 0:
                image_data = cur_image_data
                image_labels = cur_image_labels
                meta_df = sub_meta_df
            else:
                image_data = np.concatenate((image_data, cur_image_data))
                image_labels = np.concatenate((image_labels, cur_image_labels))
                meta_df = meta_df.append(sub_meta_df, ignore_index=True)

        meta_df = partition_data(meta_df, LABEL_CLASS_MAP,
                                 mode='MATLAB', train_ratio=0.8)
        meta_df.to_csv(metadata_filepath)
        logger.info('Total infected images: {}'.format(infected))
        logger.info('Total clear images: {}'.format(clear))

        # save to hdf5 file
        save_hdf5(train_data_filepath, meta_df, image_data,
                  image_labels, mode='train', datetime=datetime.now())
        save_hdf5(test_data_filepath, meta_df, image_data,
                  image_labels, mode='test', datetime=datetime.now())

        logger.info(
            f'Saved HDF5 files in {train_data_filepath} and {test_data_filepath}')
    except Exception as e:
        logger.debug(f'Converter error: {e}')
        if instance:
            remove_dirs(instance)
            instance.delete()
