import os
import h5py
import argparse
import pandas as pd
import numpy as np
import glob
from pathlib import Path
from PIL import Image

from sklearn.metrics import confusion_matrix

import torch
import torch.nn.functional as F
import torchvision.transforms as tvtrans


import pdb


np.random.seed(2020)


def load_f5py(dataset_para):
    """
        Load data from HDF5 files or image directory
    """
    f = h5py.File(dataset_para['dataset_folder'] /
                  dataset_para['test_filepath'], 'r')
    image_ds = f['images']
    images = image_ds[:, ]
    label_ds = f['labels']
    labels = label_ds[:]
    return images, labels


def load_dir(dataset_para):
    label_class_map = {'Clear': 0, 'Infected': 1}

    image_folder = dataset_para['image_folder']
    image_filenames = glob.glob(str(image_folder / '*.jpg'))
    num = len(image_filenames)
    images = np.ndarray(shape=(num, 224, 224, 3), dtype=np.uint8)
    labels = np.zeros(shape=(num, 1), dtype=np.uint8)
    image_filename_list = []
    # Example filename: 57-Horizon_69_Clear/Infected.jpg, '/' means or
    #                   1-B9_cinerea_127.jpg, not manually classified
    for i, image_filename in enumerate(image_filenames):
        # Get labels if possible
        image_filename = os.path.basename(image_filename)
        image_filename_text = os.path.splitext(image_filename)[0]
        filename_strs = image_filename_text.split('_')
        # Determine classified or not
        if filename_strs[-1] in list(label_class_map.keys()):
            labels[i] = label_class_map[filename_strs[-1]]

        image_filepath = image_folder / image_filename
        img = Image.open(image_filepath)
        images[i] = np.asarray(img)
        image_filename_list.append(image_filename_text)

    return images, image_filename_list, labels


def pred_img(img, model):
    """
        Get predicted image class and prob using well-trained model
    Args:
        img: PIL image or np.ndarray
    """

    out = model(img)

    pred = torch.argmax(out, axis=1)
    prob = F.softmax(out, dim=1)

    return pred, prob


def categorize(pred, true, idx, t_p, t_n, f_p, f_n):
    """
        Categorize each predicted result into one of four categories in a confusion matrix
    """
    status = "Correct"
    if pred == 0:
        if pred == true:
            t_n.append(idx)
        else:
            f_n.append(idx)
            status = "Incorrect"
    else:
        if pred == true:
            t_p.append(idx)
        else:
            f_p.append(idx)
            status = "Incorrect"

    return status


if __name__ == "__main__":
    from helper import init_model, load_model, parse_model, plot_confusion_matrix

    """ Usge
    python inference.py 
            --model_type SqueezeNet 
            --loading_epoch 190 
            --timestamp Jun04_18-18-46 
            --dataset_path /Users/tim/Documents/Cornell/CAIR/BlackBird/Data/Hyphal_2019
            --model_path /Users/tim/Documents/Cornell/CAIR/BlackBird/Data/Hyphal_2019
    """

    parser = argparse.ArgumentParser()
    parser.add_argument('--model_type',
                        default='GoogleNet',
                        help='model used for training')
    parser.add_argument('--loading_epoch',
                        type=int,
                        required=True,
                        help='xth model loaded for inference')
    parser.add_argument('--timestamp', required=True, help='model timestamp')
    parser.add_argument('--outdim', type=int, default=2,
                        help='number of classes')
    parser.add_argument('--cuda', action='store_true', help='enable cuda')
    parser.add_argument('--cuda_id',
                        default="1",
                        help='specify cuda')
    parser.add_argument('--img_folder', type=str,
                        default='images', help='image folder')
    parser.add_argument('--dataset_path', type=str,
                        required=True, help='path to data')
    parser.add_argument('--model_path', type=str,
                        required=True, help='path to model')
    parser.add_argument('--HDF5', type=bool, default=True,
                        help='path to model')
    opt = parser.parse_args()

    model_para = parse_model(opt)
    result_root_path = Path(opt.model_path) / 'results'
    dataset_root_path = Path(opt.dataset_path) / 'data'
    image_folder = dataset_root_path / opt.img_folder

    output_filepath = dataset_root_path / 'inference.csv'
    test_filepath = 'test_set.hdf5'

    dataset_para = {
        'dataset_folder': dataset_root_path,
        'test_filepath': test_filepath,
        'image_folder': image_folder
    }
    print(opt)

    if opt.HDF5:
        # Import data from HDF5
        images, labels = load_f5py(dataset_para)
        test_transform = tvtrans.Compose([
            tvtrans.ToPILImage(),
            tvtrans.ToTensor(),
            tvtrans.Normalize((0.5, ), (0.5, ))
        ])
    else:
        # Import data from image direcotry
        images, image_filenames, labels = load_dir(dataset_para)
        test_transform = tvtrans.Compose([
            tvtrans.ToTensor(),
            tvtrans.Normalize((0.5, ), (0.5, ))
        ])

    # Load model
    cuda_id = model_para['cuda_id']
    model, device = load_model(model_para)
    model.eval()

    # Write CSV
    META_COL_NAMES = ['id', 'predicted class', 'true class', 'status']
    pred_df = pd.DataFrame(columns=META_COL_NAMES)

    print("INFERENCE START")

    correct_counts = total_counts = 0
    class_name_map = {0: 'Clear',  1: 'Infected'}
    # Confusion matrix
    y_true = []
    y_pred = []
    # Positive: infected, negative: clear
    f_n = []
    f_p = []
    t_n = []
    t_p = []

    for idx in range(images.shape[0]):
        cur_img = images[idx]
        preproc_img = test_transform(cur_img).unsqueeze(0).to(device)
        cur_label = labels[idx]
        y_true.append(cur_label[0])
        # cur_filename = image_filenames[idx]
        pred, prob = pred_img(preproc_img, model)
        y_pred.append(pred)
        status = categorize(pred, cur_label[0], idx, t_p, t_n, f_p, f_n)
        record_df = pd.DataFrame(
            [[idx, class_name_map[pred], class_name_map[cur_label[0]], status]], columns=META_COL_NAMES)

        correct_counts += 1 if pred == cur_label[0] else 0
        total_counts += 1
        pred_df = pred_df.append(record_df, ignore_index=True)

        print('Image idx: {0}\tCorrect label: {1}\tPredicted label: {2}'.format(
            idx, cur_label[0], pred))

    cm = confusion_matrix(y_true, y_pred)
    plot_confusion_matrix(dataset_root_path, cm, list(
        class_name_map.values()), normalize=True)
    accuracy = 100.0 * correct_counts / total_counts
    print('Accuracy of the network on the {0} val images: {1:.3f}%'.format(
        total_counts, accuracy))

    print("INFERENCE FINISHED")

    pred_df.to_csv(output_filepath, index=False)
    print('Saved {}'.format(output_filepath))

    np.random.shuffle(t_p)
    np.random.shuffle(t_n)
    np.random.shuffle(f_p)
    np.random.shuffle(f_n)
    print('True infected patches\' idx : {}'.format(t_p[:10]))
    print('False infected patches\' idx : {}'.format(f_p[:10]))
    print('True clear patches\' idx : {}'.format(t_n[:10]))
    print('False clear patches\' idx : {}'.format(f_n[:10]))
 