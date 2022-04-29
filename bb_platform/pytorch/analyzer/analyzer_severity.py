import os
import sys
import time
import argparse
from pathlib import Path
import pandas as pd
import numpy as np
from PIL import Image

from torchvision import transforms

from classification.inference import pred_img
from classification.helper import timeSince, load_model, parse_model

from analysis.leaf_mask import leaf_mask, on_focus
from analysis.analysis_helper import slding_window, pad_images, resize_images


import pdb

np.random.seed(2020)


""" Usage
Analize the full-size leaf disc images to get the severity rate only

python analyzer.py 
        --model_type SqueezeNet
        --loading_epoch 190 
        --timestamp Jun04_18-18-46
        --dataset_path /Users/tim/Documents/Cornell/CAIR/BlackBird/Data/Hyphal_2019
        --model_path /Users/tim/Documents/Cornell/CAIR/BlackBird/Data/Hyphal_2019
"""
parser = argparse.ArgumentParser()
parser.add_argument('--model_type',
                    default='SqueezeNet',
                    help='model used for training')
parser.add_argument('--loading_epoch',
                    type=int,
                    required=True,
                    help='xth model loaded for inference')
parser.add_argument('--timestamp', required=True, help='model timestamp')
parser.add_argument('--outdim', type=int, default=2, help='number of classes')
parser.add_argument('--cuda', action='store_true', help='enable cuda')
parser.add_argument('--cuda_id',
                    default="0",
                    help='specify cuda id')
parser.add_argument('--target_class',
                    default="1",
                    help='class heatmap')
parser.add_argument('--step_size', type=int, default=224,
                    help='step size of sliding window')
parser.add_argument('--dataset_path', type=str, required=True,
                    help='root path to the data')
parser.add_argument('--model_path', type=str, required=True,
                    help='root path to the model')
opt = parser.parse_args()
print(opt)

image_timestamp = '07-03-19_1dpi'
model_para = parse_model(opt)
dataset_root_path = Path(opt.dataset_path) / 'data' / image_timestamp
output_csv_filepath = dataset_root_path / \
    f'severity-rate-{image_timestamp}.csv'

# Ad-hoc
image_folders = []
trays = os.listdir(dataset_root_path)
# trays = sorted(trays, key=lambda t: int(t[-1]))
for tray in trays:
    image_folders.append(dataset_root_path / tray)

# Image
CHANNELS = 3
IMG_WIDTH = 224
IMG_HEIGHT = 224
IMG_EXT = '.jpg'
INPUT_SIZE = (IMG_WIDTH, IMG_HEIGHT)
target_class = int(opt.target_class) if opt.target_class != 'None' else None
step_size = opt.step_size

# Threshold for severity ratio
down_th = 0.4
up_th = 0.9

# Model
model, device = load_model(model_para)
model.eval()

# Input preprocessing transformation
preprocessing = transforms.ToTensor()
normalize = transforms.Normalize((0.5, ), (0.5, ))

# Write severity ratio as CSV files
META_COL_NAMES = ['id', 'timestamp', 'tray', 'filename',
                  'severity rate (pixel level)', 'severity rate (patch level)']
severity_rate_df = pd.DataFrame(columns=META_COL_NAMES)

# Crop and assembly
# For the first five full-size leaf disc images, we would like to save
# the corresponding image patches

for tray_id, image_folder in enumerate(image_folders):
    tray = trays[tray_id]
    imagenames = os.listdir(image_folder)

    for idx, imagename in enumerate(imagenames[:]):
        print('Processing {} {} {}'.format(image_timestamp, tray, imagename))
        img_path = image_folder / imagename
        im = Image.open(img_path)
        imagename_text = os.path.splitext(imagename)[0]

        # Timer
        start_time = time.time()

        # Add padding and resize
        padding_im = pad_images(im, step_size, IMG_WIDTH, IMG_HEIGHT)
        resized_im = resize_images(im, padding_im)
        preproc_full_img = preprocessing(resized_im)

        print('Finished padding and resizing: {}'.format(timeSince(start_time)))

        # Masking
        imask = leaf_mask(resized_im, rel_th=0.1)
        if imask is None:
            print('Image: {}\tmasking ERROR'.format(imagename_text))
            continue
        imask = imask.astype('uint8') / 255
        print('Finished masking: {}'.format(timeSince(start_time)))

        # Get info of resized image subim_x: number of patches one row
        width, height = resized_im.size
        subim_x = slding_window(width, IMG_WIDTH, step_size, ceil=False)
        subim_y = slding_window(height, IMG_HEIGHT, step_size, ceil=False)

        patch_idx = coor_x = coor_y = 0
        # Lost focused subimg
        lost_focus = 0

        # Counter of each pixel
        counting_map = np.zeros(shape=(height, width))
        # For probability array is arranged as S x H x W , S: image patch number
        prob_attrs = np.zeros(
            shape=(subim_x * subim_y, 1, IMG_HEIGHT, IMG_WIDTH), dtype=np.float)
        infected_patch = total_patch = 0

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
                    # Get probability
                    pred, prob = pred_img(normalized_inp, model)
                    # Store
                    prob_attrs[patch_idx] = prob[1].cpu().detach().item()
                    total_patch += 1
                    infected_patch += 1 if pred == 1 else 0
                # Update pixel counter each loop to avoid ZeroDivisionError
                counting_map[coor_y: coor_y + IMG_HEIGHT,
                             coor_x: coor_x + IMG_WIDTH] += 1
                coor_x += step_size
                patch_idx += 1
            coor_x = 0
            coor_y += step_size

        print('Finished crop and inference: {}'.format(timeSince(start_time)))

        # Reconstruction
        prob_heatmap = np.ndarray(shape=(1, height, width), dtype=np.float)

        patch_idx = coor_x = coor_y = 0
        for _ in range(subim_y):
            for _ in range(subim_x):
                prob_heatmap[:, coor_y: coor_y + IMG_HEIGHT,
                             coor_x: coor_x + IMG_WIDTH] += prob_attrs[patch_idx]
                coor_x += step_size
                patch_idx += 1
            coor_x = 0
            coor_y += step_size

        # Divide by counting_map
        prob_heatmap = prob_heatmap / counting_map

        print('Finished saving: {}'.format(timeSince(start_time)))

        # Calculate severity ratio
        lost_focus = len(prob_heatmap[prob_heatmap == 0])
        num_clear = len(prob_heatmap[prob_heatmap <= down_th]) - lost_focus
        num_infected = len(prob_heatmap[prob_heatmap >= up_th])
        severity_rate = round(
            num_infected / (num_infected + num_clear) * 100, 2)
        severity_rate_patch = round(infected_patch / total_patch * 100, 2)

        record_df = pd.DataFrame(
            [[idx, image_timestamp, tray, imagename_text,
                severity_rate, severity_rate_patch]], columns=META_COL_NAMES
        )
        severity_rate_df = severity_rate_df.append(
            record_df, ignore_index=True)

        print('Number of lost focused pixels: {}'.format(lost_focus))
        print('Number of clear pixels: {}'.format(num_clear))
        print('Number of infected pixels: {}'.format(num_infected))
        print('-------------------------------------------')
        print('Number of infected patches: {}'.format(infected_patch))
        print('Number of patches: {}'.format(total_patch))
        print('-------------------------------------------')
        print('Severity ratio: pixel-level {:.2f}% patch-levle {:.2f}%'.format(
            severity_rate, severity_rate_patch))

        print('Analysis finished: {}'.format(timeSince(start_time)))
        print('-------------------------------------------')

severity_rate_df.to_csv(output_csv_filepath, index=False)
print('Saved {}'.format(output_csv_filepath))
