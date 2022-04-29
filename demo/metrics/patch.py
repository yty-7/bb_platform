import numpy as np


def metric(patch_info, pixel_info, heatmap_info, threshold_info):
    """
        Calculate patch level severity rate using probability heatmap
    """
    prob_heatmap = heatmap_info['prob_heatmap']
    patch_down_th = threshold_info['patch_down_th']
    patch_up_th = threshold_info['patch_up_th']

    infected_pixel = len(prob_heatmap[prob_heatmap >= patch_up_th])
    clear_pixel = len(prob_heatmap[prob_heatmap <= patch_down_th]
                      ) - len(prob_heatmap[prob_heatmap == -np.inf])

    return round((infected_pixel / (infected_pixel + clear_pixel) * 100), 2)
