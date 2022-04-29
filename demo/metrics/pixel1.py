import numpy as np


def metric(patch_info, pixel_info, heatmap_info, threshold_info):
    """
        Calculate pixel level severity rate using gradcam heatmap
    """
    total_pixel = pixel_info['total_pixel']
    lost_focus_pixel = pixel_info['lost_focus_pixel']

    pixel_up_th = threshold_info['pixel_up_th']

    severity_rates = {}

    heatmap_info.pop('prob_heatmap', None)
    for key, val in heatmap_info.items():

        mask_copy = val.copy()
        mask_copy[mask_copy < pixel_up_th] = 0
        mask_copy[mask_copy >= pixel_up_th] = 1
        val = mask_copy.astype('uint8')

        total_pixel = val.shape[0] * val.shape[1]
        infected_pixel = len(val[val == 1])
        clear_pixel = len(val[val == 0])
        assert clear_pixel + infected_pixel == total_pixel, 'pixel level metric assertion error'

        severity_rates[key] = round(infected_pixel / (total_pixel - lost_focus_pixel) * 100, 2)

    return severity_rates
