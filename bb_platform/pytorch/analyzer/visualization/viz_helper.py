import os

import numpy as np
from matplotlib import pyplot as plt
from pytorch.analyzer.visualization.viz_util import visualize_image_attr, visualize_image_attr_multiple


def get_last_conv_layer(model):
    """
        Get the last convolutional layer given model
    """
    model_name = model.__class__.__name__
    if model_name == 'VGG':
        last_conv_layer = model.features[28]
    elif model_name == 'SqueezeNet':
        last_conv_layer = model.features[12].expand3x3
    elif model_name == 'ResNet':
        last_conv_layer = model.layer4[-1].conv2

    # pdb.set_trace()

    return last_conv_layer


def viz_image_attr(original_image, image_attr_dict, cmap, outlier_perc=5, figsize=(10, 10), alpha_overlay=0.4):
    """
        Generate visualization figures using various techniques
    Args:
        original_image:     Original images for the purpose of blending
        image_attr_dict:    Dictionary for attributions, where key is the technique and value is the outputted value array
        cmap:               Color map
    Return:
        heatmap_figs:               plt figure heatmap objects
        hist_figs:                  plt figure histogram objects
    """
    heatmap_figs = {}
    # hist_figs = {}
    for key, value in image_attr_dict.items():
        if key == 'Guided-GradCam':
            value = value * 255
        heatmap_fig, _, norm_attrs = visualize_image_attr_multiple(
            attr=value[:, :, np.newaxis],
            original_image=original_image,
            alpha_overlay=alpha_overlay,
            methods=["blended_heat_map", "heat_map"],
            signs=["positive", "positive"],
            outlier_perc=outlier_perc,
            cmap=cmap,
            fig_size=figsize,
            titles=[f'Blended {key}', f'{key} heatmap'],
            use_pyplot=False,
            show_colorbar=True
        )
        heatmap_figs[key] = heatmap_fig

        # hist_fig, hist_axis = plt.subplots(figsize=figsize)
        # hist_axis.hist(norm_attrs[0].reshape(1, -1).squeeze(0))
        # hist_figs[key] = hist_fig

    return heatmap_figs


def save_figs(output_folder, imagename, figs, patch_idx=None):
    """
        Save visualized results to local
    Args:
        output_folder:    
        imagename:        Current image filename
        figs:             Dictionary for figures, where key is the technique and value is the outputted figure
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder, exist_ok=True)

    for key, value in figs.items():
        imagename_patch = imagename + (f'-{patch_idx}' if patch_idx else '')
        output_filepath = os.path.join(
            output_folder, f'{imagename_patch}-with-{key}.png')
        value.savefig(output_filepath, bbox_inches='tight', dpi=300)
        print(f'Saved {output_filepath}')
