import numpy as np


def metric(patch_info, pixel_info, heatmap_info, threshold_info):
    """
        Calculate pixel level (mask out uncertain pixels) severity rate using gradcam heatmap
    """
    total_pixel = pixel_info['total_pixel']
    lost_focus_pixel = pixel_info['lost_focus_pixel']

    prob_heatmap = heatmap_info['prob_heatmap']
    gc_heatmap_pos = heatmap_info['gc_heatmap_pos']

    patch_down_th = threshold_info['patch_down_th']
    patch_up_th = threshold_info['patch_up_th']
    pixel_up_th = threshold_info['pixel_up_th']

    mask_heatmap = prob_heatmap.copy()
    # lost focused pixels
    mask_heatmap[mask_heatmap == -np.inf] = 0.0
    mask_heatmap[(mask_heatmap > patch_down_th) & (
        mask_heatmap < patch_up_th)] = 0.0  # uncertain pixels
    mask_heatmap = (mask_heatmap != 0.0)

    gc_heatmap_pos = gc_heatmap_pos * mask_heatmap
    infected_pixel = len(
        gc_heatmap_pos[gc_heatmap_pos >= pixel_up_th])
    clear_pixel = len(gc_heatmap_pos[gc_heatmap_pos < pixel_up_th])
    assert clear_pixel + infected_pixel == total_pixel
    return round(infected_pixel / (total_pixel - lost_focus_pixel) * 100, 2)

