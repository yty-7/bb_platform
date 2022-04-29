import os
import sys
import time
import argparse
from pathlib import Path
import pandas as pd
import numpy as np
from PIL import Image
from matplotlib import pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

from torchvision import transforms

from classification.helper import timeSince, load_model, parse_model

from visualization.viz_helper import get_last_conv_layer, viz_image_attr, save_figs

from captum.attr import visualization as viz
from captum.attr import GuidedGradCam, GuidedBackprop, LayerGradCam, LayerActivation, LayerAttribution


import pdb


""" Usage
Analize individual image patches

python analyzer.py 
        --model_type VGG
        --loading_epoch 98 
        --timestamp Jul30_03-29-51
        --dataset_path /Users/tim/Documents/Cornell/CAIR/BlackBird/Data/Hyphal_2020
        --model_path /Users/tim/Documents/Cornell/CAIR/BlackBird/Data/Hyphal_2020
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
parser.add_argument('--dataset_path', type=str, required=True,
                    help='root path to the data')
parser.add_argument('--model_path', type=str, required=True,
                    help='root path to the model')
opt = parser.parse_args()
print(opt)

image_folder_name = 'false-infected'
model_para = parse_model(opt)
dataset_root_path = Path(opt.dataset_path) / 'data'
image_folder = dataset_root_path / image_folder_name
imagenames = os.listdir(image_folder)

# Image
target_class = int(opt.target_class) if opt.target_class != 'None' else None

# Model
model, device = load_model(model_para)
model.eval()
last_conv_layer = get_last_conv_layer(model)

# Input preprocessing transformation
preprocessing = transforms.ToTensor()
normalize = transforms.Normalize((0.5, ), (0.5, ))

# Captum
lgc = LayerGradCam(model, last_conv_layer)
gbp = GuidedBackprop(model)
guided_gc = GuidedGradCam(model, last_conv_layer)

# Green-Red color blindness
default_cmap = LinearSegmentedColormap.from_list(
    "MyColor", ["white", "blue", "red"]
)

for imagename in imagenames:
    if imagename == '.DS_Store':
        continue
    image_filepath = image_folder / imagename
    img = Image.open(image_filepath)
    imagename_text = os.path.splitext(imagename)[0]

    preproc_img = preprocessing(img)
    normalized_inp = normalize(preproc_img).unsqueeze(0).to(device)
    normalized_inp.requires_grad = True

    # Get attribution (resize GradCam)
    gc_attr = lgc.attribute(normalized_inp, target_class)
    gc_attr = LayerAttribution.interpolate(
        gc_attr, normalized_inp.shape[2:])
    gbp_attr = gbp.attribute(normalized_inp, target_class)
    guided_gc_attr = gbp_attr * gc_attr

    # Visualization
    image_attr_dict = {'GradCam': gc_attr[0].cpu().detach().numpy(),
                       'Guided-BP': gbp_attr[0].cpu().detach().numpy(), 'Guided-GradCam': guided_gc_attr[0].cpu().detach().numpy()}
    heatmap_figs, hist_figs = viz_image_attr(preproc_img.permute(
        1, 2, 0).numpy(), image_attr_dict, default_cmap)
    output_image_patch_folder = image_folder
    save_figs(output_image_patch_folder,
              imagename_text, heatmap_figs)
