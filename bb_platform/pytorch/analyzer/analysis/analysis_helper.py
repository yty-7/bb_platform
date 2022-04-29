import math
import json
import numpy as np
import cv2


import torch
import torch.nn as nn
from torchvision import models

from captum.attr import LayerAttribution


def slding_window(length, fix, step_size, ceil=False):
    """
        Calculate the total number of steps
    Args:
        length:        Total length
        fix:           Fixed length like kernel size in the convolution op
        step_size:     Step length like stride in the convolution op
    """
    steps = 0
    if ceil:
        steps = math.ceil((length - fix) / step_size) + 1
    else:
        steps = math.floor((length - fix) / step_size) + 1

    return steps


def pad_images(img, step_size, IMG_WIDTH, IMG_HEIGHT):
    """
        Add padding into images
    """
    width, height = img.size
    subim_x = slding_window(width, IMG_WIDTH, step_size, ceil=True)
    subim_y = slding_window(height, IMG_HEIGHT, step_size, ceil=True)

    # Calculate padding for the right and bottom side
    padding_x = (subim_x - 1) * step_size + IMG_WIDTH - width
    padding_y = (subim_y - 1) * step_size + IMG_HEIGHT - height

    return [padding_x, padding_y]


def resize_images(img, padding):
    """
    Return: 
        Resized images
    """
    padding_x, padding_y = padding
    width, height = img.size
    shape = (width + padding_x, height + padding_y)

    return img.resize(shape)


def grayscale_3d_img(image_3d, percentile=99):

    image_2d = np.sum(np.abs(image_3d), axis=0)

    vmax = np.percentile(image_2d, percentile)
    vmin = np.min(image_2d)

    return np.clip((image_2d - vmin) / (vmax - vmin), 0, 1)


def abs_grayscale_norm(img):
    """Returns absolute value normalized image 2D."""
    assert isinstance(img, np.ndarray), "img should be a numpy array"

    shp = img.shape
    if len(shp) < 2:
        raise ValueError("Array should have 2 or 3 dims!")
    if len(shp) == 2:
        img = np.absolute(img)
        img = img/float(img.max())
    else:
        img = grayscale_3d_img(img)
    return img


def get_saliency_masks(saliency_methods, input_img, logits_class, relu_attributions=True):
    output_masks = {}
    for key, method in saliency_methods.items():
        if key == 'Explanation\nMap':
            attr = method.attribute(input_img)
            attr = attr[np.newaxis, ...]
        elif key == 'Occlusion':
            attr = method.attribute(input_img, target=logits_class, strides=(
                3, 8, 8), sliding_window_shapes=(3, 10, 10))
        elif key == 'GradCAM':
            attr = method.attribute(
                input_img, target=logits_class, relu_attributions=relu_attributions)
            attr = LayerAttribution.interpolate(
                attr, input_img.shape[2:], interpolate_mode='bilinear')
        elif 'SG' in key:
            attr = method.attribute(
                input_img, n_samples=4, stdevs=0.15, nt_type='smoothgrad', target=logits_class)
        else:
            attr = method.attribute(input_img, target=logits_class)

        if len(attr.shape) > 3:
            attr = attr[0]
        if not isinstance(attr, np.ndarray):
            attr = attr.cpu().detach().numpy()
        output_masks[key] = abs_grayscale_norm(attr)

    if 'Guided\nBackProp' in output_masks.keys():
        output_masks['GBP-GC'] = np.multiply(
            output_masks['Guided\nBackProp'], output_masks['GradCAM'])

    return output_masks


def hard_thresholding(mask, threshold, vmin=0, vmax=1):
    """
    Args:
        vmin:        Value represents healthy pixels
        vmax:        Value represents infected pixels
    """
    mask_copy = mask.copy()
    mask_copy[mask_copy < threshold] = vmin
    mask_copy[mask_copy >= threshold] = vmax

    return mask_copy.astype('uint8')