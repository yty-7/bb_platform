import os
import json
import argparse
import pandas as pd
from pathlib import Path
import numpy as np

from PIL import Image
from datetime import datetime

from pytorch.converter.utils import load_json, partition_data, save_hdf5, remove_dirs
from pytorch.config import (IMG_EXT, IMG_HEIGHT, IMG_WIDTH,
                            IMG_ORI_EXT, CHANNELS, META_COL_NAMES, LABEL_CLASS_MAP)

from rest_framework.exceptions import ValidationError

from django.conf import settings

logger = settings.LOGGER


def converter(path, dirs=[], instance=None):
    """
    Args:
        Similar to MATLAB conversion
    """
    try:
        logger.info('Run VIA converter')

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
            json_filepath = sub_folder / 'annotation.json'
            sub_meta_df = pd.DataFrame(columns=META_COL_NAMES)

            annotation_data = load_json(json_filepath)
            # Two different json formats
            annotation_metadata = annotation_data.pop(
                '_via_img_metadata', False)
            if not annotation_metadata:
                annotation_metadata = annotation_data
            for i, (k, item) in enumerate(annotation_metadata.items()):
                # Image filename
                filename = item['filename']
                filename_strs = os.path.splitext(filename)[0].split('_')
                patch_id = filename_strs[-2]
                file_attributes = item['file_attributes']
                # Image label
                label = file_attributes['Infection']
                label_id = LABEL_CLASS_MAP[label]
                subset = 'NA'
                record_df = pd.DataFrame([[i + total_samples, filename, patch_id, label_id, subset]],
                                         columns=META_COL_NAMES)
                sub_meta_df = sub_meta_df.append(record_df, ignore_index=True)

            num_samples = len(sub_meta_df)
            total_samples += num_samples

            # Numpy arrays for data and labels
            # Data array is arranged as S x H x W x C, S: sample number, C: channel number
            cur_image_data = np.ndarray(shape=(num_samples, IMG_WIDTH,
                                               IMG_HEIGHT, CHANNELS), dtype=np.uint8)
            cur_image_labels = np.zeros(shape=(num_samples, 1), dtype=np.uint8)

            for i, row_df in sub_meta_df.iterrows():
                if i > -1:
                    imagename = row_df['filename']
                    image_path = image_folder / imagename
                    img = Image.open(image_path)
                    img_arr = np.asarray(img)
                    cur_image_data[i, :, :, :] = img_arr
                    cur_image_labels[i] = row_df['class_id']
                    # Count class distribution
                    if cur_image_labels[i] == 1:
                        infected += 1
                    else:
                        clear += 1
                    # print('Processed {0}/{1}'.format(i+1, num_samples))

            if idx == 0:
                image_data = cur_image_data
                image_labels = cur_image_labels
                meta_df = sub_meta_df
            else:
                image_data = np.concatenate((image_data, cur_image_data))
                image_labels = np.concatenate((image_labels, cur_image_labels))
                meta_df = meta_df.append(sub_meta_df, ignore_index=True)

        meta_df = partition_data(meta_df, LABEL_CLASS_MAP,
                                 mode='LabelBox', train_ratio=0.8)
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
