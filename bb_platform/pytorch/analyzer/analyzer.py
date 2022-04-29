import os
import sys
import time
import argparse
import pandas as pd
import numpy as np
import shutil

from django.conf import settings

from importlib import import_module
from pathlib import Path
from zipfile import ZipFile
from PIL import Image
from matplotlib.colors import LinearSegmentedColormap

from torchvision import transforms

from datasets.utils import extract_filename

from pytorch.config import (
    CHANNELS, IMG_WIDTH, IMG_HEIGHT, IMG_EXT, INPUT_SIZE)

from pytorch.analyzer.classification.inference import pred_img
from pytorch.analyzer.classification.helper import timeSince, load_model

from pytorch.analyzer.analysis.leaf_mask import leaf_mask, on_focus
from pytorch.analyzer.analysis.analysis_helper import slding_window, pad_images, resize_images, get_saliency_masks

from pytorch.analyzer.visualization.viz_helper import get_last_conv_layer, viz_image_attr, save_figs
from pytorch.analyzer.visualization.viz_util import _normalize_image_attr

from captum.attr import visualization as viz
from captum.attr import LayerGradCam, Saliency

np.random.seed(2020)

logger = settings.LOGGER


""" Usage
python analyzer.py
        --outdim 2
        --cuda true
        --cuda_id 0
        --target_class 1
        --step_size 224
        --model_type SqueezeNet
        --project_folder /media/projects/timmy/project_name/dataset_name
        --dataset_folder /media/datasets/tim/dataset/extract/Inference/
        --model_filepath /media/pytorch_models/processing/SqueezeNet/SqueezeNet_model_ep190
"""


def analyzer(opt, instance):
    """
    Args:
        instance:     the intermedia table instance used to store outputted results' path
            output_path:           /media/projects/username/project_name/dataset_name/    
            image_output_path:     output_path + /images
            csv_output_path:       output_path + /files
    """
    try:
        logger.info('Analysis start')

        # Update instance status in database
        instance.status = 'R'
        instance.save()

        dataset_root_path = Path(opt['dataset_folder'])
        output_folder = Path(opt['output_folder'])

        # List all tray folders
        tray_folders = [f for f in os.listdir(dataset_root_path) if os.path.isdir(
            os.path.join(dataset_root_path, f)) and not f.startswith('__MACOSX')]

        # Basic config
        # Threshold for severity ratio
        target_class = int(opt['target_class']
                           ) if opt['target_class'] != 'None' else None
        step_size = 224
        patch_down_th = 0.2
        patch_up_th = 0.8
        pixel_up_th = 0.2
        pixel_down_th = -0.2

        # Model
        model, device = load_model(opt)
        model.eval()
        last_conv_layer = get_last_conv_layer(model)

        logger.info(f'Analysis using: {device}')

        # Input preprocessing transformation
        preprocessing = transforms.ToTensor()
        means = [118./255., 165./255., 92./255.]
        stds = [40./255., 35./255., 51./255.]
        normalize = transforms.Normalize(means, stds)

        # Captum
        saliency_methods = {} 
        saliency_methods_dict = settings.SALIENCY_FUNC
        for sm in opt['saliency_methods']:
            sm_name = saliency_methods_dict[sm]
            if sm_name == 'GradCAM':
                saliency_methods[sm_name] = LayerGradCam(model, last_conv_layer)
            elif sm_name == 'Gradient':
                saliency_methods[sm_name] = Saliency(model)

        lgc = LayerGradCam(model, last_conv_layer)

        # Green-Red color blindness
        default_cmap = LinearSegmentedColormap.from_list(
            "MyColor", ["white", "blue", "red"]
        )

        # Write severity ratio as CSV files
        META_COL_NAMES = ['id', 'filename']

        # Dynamically load metric functions
        metrics = []
        metric_func_dict = settings.METRIC_FUNC

        for metric_func in opt['metric_funcs']:
            metric_name = metric_func_dict[metric_func.metric_func]
            metric_func_filepath = metric_func.filepath.path
            metric_func_rel_filepath = extract_filename(metric_func_filepath)
            # Exclude suffix .py
            metric_func_valid_filepath = '.'.join(
                metric_func_rel_filepath.split(os.sep))[:-3]

            metric_module = import_module(metric_func_valid_filepath)
            metric = getattr(metric_module, 'metric')
            metrics.append(metric)

            META_COL_NAMES.append(metric_name)

        severity_rate_df = pd.DataFrame(columns=META_COL_NAMES)

        # Crop and assembly
        for tray_folder in tray_folders:
            image_folder = dataset_root_path / tray_folder / 'images'
            output_image_folder = output_folder / 'images' / tray_folder
            output_file_folder = output_folder / 'files' / tray_folder

            imagenames = [f for f in os.listdir(
                image_folder) if not f.startswith('.DS_Store')]

            output_csv_filepath = output_file_folder / 'severity-rate.csv'

            for idx, imagename in enumerate(imagenames[:]):
                logger.info('Processing: {}'.format(imagename))

                img_path = image_folder / imagename
                try:
                    im = Image.open(img_path)
                except Exception as e:
                    logger.debug(f'Open image error: {e}')
                    logger.debug(f'Image path: {img_path}')
                    continue

                imagename_text = os.path.splitext(imagename)[0]
                # Timer
                start_time = time.time()
                # Add padding and resize
                padding_im = pad_images(im, step_size, IMG_WIDTH, IMG_HEIGHT)
                resized_im = resize_images(im, padding_im)
                preproc_full_img = preprocessing(resized_im)

                # Masking
                imask = leaf_mask(resized_im, rel_th=opt['rel_th'])
                if imask is None:
                    logger.debug(f'Masking error: {imagename_text}')
                    continue
                imask = imask.astype('uint8') / 255

                # Get info of resized image subim_x: number of patches one row
                width, height = resized_im.size
                subim_x = slding_window(
                    width, IMG_WIDTH, step_size, ceil=False)
                subim_y = slding_window(
                    height, IMG_HEIGHT, step_size, ceil=False)

                patch_idx = coor_x = coor_y = 0
                # Lost focused subimg
                infected_pixel = clear_pixel = discard_pixel = lost_focus_pixel = total_pixel = 0
                infected_patch = clear_patch = discard_patch = lost_focus_patch = total_patch = 0

                # Counter of each pixel
                counting_map = np.zeros(shape=(height, width))
                # For probability array and Grad-CAM activation array is arranged as S x H x W , S: image patch number
                # For Guided BP/GradCam, shape is S x C x H x W
                prob_attrs = np.zeros(
                    shape=(subim_x * subim_y, IMG_HEIGHT, IMG_WIDTH), dtype=np.float)

                saliency_attrs = {}
                for saliency_method_key in saliency_methods.keys():
                    saliency_attrs[saliency_method_key] = np.zeros(
                        shape=(subim_x * subim_y, IMG_HEIGHT, IMG_WIDTH), dtype=np.float)

                # Crop
                for _ in range(subim_y):
                    for _ in range(subim_x):
                        subim_mask = imask[coor_y: coor_y + IMG_HEIGHT,
                                           coor_x: coor_x + IMG_WIDTH]
                        if on_focus(subim_mask):
                            # Cropping
                            box = (coor_x, coor_y, coor_x +
                                   IMG_WIDTH, coor_y + IMG_HEIGHT)
                            subim = resized_im.crop(box)
                            # Preprocess
                            preproc_img = preprocessing(subim)
                            normalized_inp = normalize(
                                preproc_img).unsqueeze(0).to(device)
                            normalized_inp.requires_grad = True

                            # Get probability and attribution (resize GradCam)
                            _, prob = pred_img(normalized_inp, model)
                            output_masks = get_saliency_masks(
                                saliency_methods, normalized_inp, target_class, relu_attributions=False)

                            # Store
                            prob_value = prob[0][1].cpu().detach().item()
                            prob_attrs[patch_idx] = prob_value

                            for key, val in output_masks.items():
                                saliency_attrs[key][patch_idx] = val

                            # Increment the number of infected or clear patch
                            if prob_value >= patch_up_th:
                                infected_patch += 1
                            elif prob_value <= patch_down_th:
                                clear_patch += 1
                            else:
                                discard_patch += 1
                        else:
                            # Set lost focused patches' pixel values as -inf
                            lost_focus_patch += 1
                            prob_attrs[patch_idx] = -np.inf

                        # Update pixel counter each loop to avoid ZeroDivisionError
                        counting_map[coor_y: coor_y + IMG_HEIGHT,
                                     coor_x: coor_x + IMG_WIDTH] += 1
                        coor_x += step_size
                        patch_idx += 1
                    coor_x = 0
                    coor_y += step_size

                logger.info('Finished crop and inference: {}'.format(
                    timeSince(start_time)))

                # Reconstruction
                prob_heatmap = np.zeros(
                    shape=(height, width), dtype=np.float)

                saliency_heatmaps = {}
                for key in saliency_methods.keys():
                    saliency_heatmaps[key] = np.zeros(
                        shape=(height, width), dtype=np.float)

                patch_idx = coor_x = coor_y = 0
                for _ in range(subim_y):
                    for _ in range(subim_x):
                        prob_heatmap[coor_y: coor_y + IMG_HEIGHT,
                                     coor_x: coor_x + IMG_WIDTH] += prob_attrs[patch_idx]

                        for key in saliency_methods.keys():
                            saliency_heatmaps[key][coor_y: coor_y + IMG_HEIGHT,
                                                coor_x: coor_x + IMG_WIDTH] += saliency_attrs[key][patch_idx]

                        coor_x += step_size
                        patch_idx += 1
                    coor_x = 0
                    coor_y += step_size

                # Divide by counting_map
                prob_heatmap = prob_heatmap / counting_map
                for key, val in saliency_heatmaps.items():
                    saliency_heatmaps[key] = val / counting_map

                # Total pixel
                total_patch = subim_x * subim_y
                total_pixel = width * height
                lost_focus_pixel = lost_focus_patch * IMG_HEIGHT * IMG_WIDTH

                patch_info = {'total_patch': total_patch,
                              'discard_patch': discard_patch}
                pixel_info = {'total_pixel': total_pixel,
                              'lost_focus_pixel': lost_focus_pixel}
                heatmap_info = saliency_heatmaps.copy()
                heatmap_info['prob_heatmap'] = prob_heatmap
                threshold_info = {'patch_up_th': patch_up_th, 'patch_down_th': patch_down_th,
                                  'pixel_up_th': pixel_up_th, 'pixel_down_th': pixel_down_th}

                severity_rate_record = [idx, imagename_text]
                for metric in metrics:
                    severity_rate = metric(patch_info=patch_info, pixel_info=pixel_info,
                                           heatmap_info=heatmap_info, threshold_info=threshold_info)
                    severity_rate_record.append(severity_rate)

                record_df = pd.DataFrame(
                    [severity_rate_record], columns=META_COL_NAMES)

                severity_rate_df = severity_rate_df.append(
                    record_df, ignore_index=True)


                # Save
                # image_attr_dict = {'GradCam': gc_heatmap}
                heatmap_figs = viz_image_attr(preproc_full_img.permute(
                    1, 2, 0).numpy(), saliency_heatmaps, default_cmap)

                save_figs(output_image_folder, imagename_text, heatmap_figs)

                logger.info('Analysis finished: {}'.format(
                    timeSince(start_time)))

            if not os.path.exists(output_file_folder):
                os.makedirs(output_file_folder, exist_ok=True)

            severity_rate_df.to_csv(output_csv_filepath, index=False)
            logger.info('Saved {}'.format(output_csv_filepath))

            # Zip file
            image_output_folder = output_folder / 'images'
            csv_output_folder = output_folder / 'files'
            zip_filepaths = zip_file(
                output_folder, image_output_folder, csv_output_folder)

            # Update database
            instance.output_folder = output_folder
            instance.image_output_folder = image_output_folder
            instance.csv_output_folder = csv_output_folder
            instance.image_output_zip_path = zip_filepaths['images']
            instance.csv_output_zip_path = zip_filepaths['files']
            instance.status = 'D'
            instance.save()

            logger.info('Updated intermedia table')

    except Exception as e:
        logger.info(f'Analysis error: {e}')
        logger.info(f'Requested data: {opt}')

        instance.status = 'F'
        instance.save()


def zip_file(output_path, image_output_path, csv_output_path):
    """
        Compress images and files folder after analysis completed
    """
    zip_list = ['images', 'files']
    ret = {}

    for zip_item in zip_list:
        zipped_filepath = os.path.join(output_path, f'{zip_item}.zip')
        exist = os.path.exists(zipped_filepath)
        zip_folder = image_output_path if zip_item == 'images' else csv_output_path

        # if not exist:
        #     zip_res = shutil.make_archive(zip_folder, 'zip', zip_folder)
        #     logger.info(f'Zipped {zip_folder} to {zip_res}')
        # else:
        #     # Zip file integrity check
        #     with ZipFile(zipped_filepath, 'r') as zip_ref:
        #         integrity = zip_ref.testzip()
        #     if integrity is not None:
        #         logger.debug(f'Bad file {integrity}')
        #         zip_res = shutil.make_archive(
        #             zip_folder, 'zip', zip_folder)
        #         logger.debug(f'Re-zipped {zip_folder} to {zip_res}')
        #     else:
        #         zip_res = zipped_filepath

        zip_res = shutil.make_archive(zip_folder, 'zip', zip_folder)
        logger.info(f'Zipped {zip_folder} to {zip_res}')

        ret[zip_item] = extract_filename(zip_res)

    return ret
