import os
import time
import math
import socket
import logging
import itertools
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
from datetime import datetime

import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import models


def plot_confusion_matrix(output_folder, cm, classes, normalize=False, title='Confusion matrix', cmap=plt.cm.Blues):
    """
        Plot confusion matrix
    Args:
        output_folder:
        cm:               Confusion matrix ndarray
        classes:          A list of class
    """
    if normalize:
        cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        print("Normalized confusion matrix")
    else:
        print('Confusion matrix, without normalization')

    print(cm)
    plt.imshow(cm, interpolation='nearest', cmap=cmap)
    plt.title(title)
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45)
    plt.yticks(tick_marks, classes)

    fmt = '.2f' if normalize else 'd'
    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, format(cm[i, j], fmt), horizontalalignment="center",
                 color="white" if cm[i, j] > thresh else "black")

    plt.tight_layout()
    plt.ylabel('True label')
    plt.xlabel('Predicted label')
    output_filepath = output_folder / 'confusion-matrix.png'
    plt.savefig(output_filepath)


def set_logging(log_file, log_level=logging.DEBUG):
    """
    Logging to console and log file simultaneously.
    """
    log_format = '[%(asctime)s] - [%(name)s] - [%(levelname)s] - %(message)s'
    formatter = logging.Formatter(log_format)
    logging.basicConfig(level=log_level, format=log_format, filename=log_file)
    # Console Log Handler
    console = logging.StreamHandler()
    console.setFormatter(formatter)
    console.setLevel(log_level)
    logging.getLogger().addHandler(console)
    return logging.getLogger()


def getTimestamp(f='%b%d_%H-%M-%S'):
    return datetime.now().strftime(f)


def makeSubdir(dirname):
    # Recursively make directories
    os.makedirs(dirname, exist_ok=True)


def getHostName():
    return socket.gethostname()


def logInfoWithDot(logger, text):
    logger.info(text)
    logger.info('--------------------------------------------')


def asMinutes(s):
    m = math.floor(s / 60)
    s -= m * 60
    return '%dm %ds' % (m, s)


def timeSince(since):
    now = time.time()
    s = now - since
    return '%s' % (asMinutes(s))


"""
------------PyTorch------------
"""


def load_model(opt):
    """
        Load well-trained model
    """
    cuda = True if opt['cuda'] and torch.cuda.is_available() else False
    cuda_id = opt['cuda_id'] if cuda else None

    model = init_model(opt)
    model_fullpath = str(opt['model_filepath'])
    if cuda:
        checkpoint = torch.load(model_fullpath)
    else:
        checkpoint = torch.load(
            model_fullpath,  map_location=torch.device('cpu'))
    model.load_state_dict(checkpoint['model_state_dict'])

    device = torch.device(
        f'cuda:{cuda_id}' if cuda_id != None else 'cpu')

    return model.to(device), device


def init_model(model):
    m = None
    outdim = model['outdim']
    if model['model_type'] == 'GoogleNet':
        m = models.googlenet(pretrained=True, num_classes=1000)
        m.fc = nn.Linear(m.fc.in_features, outdim, bias=True)
    elif model['model_type'] == 'SqueezeNet':
        m = models.squeezenet1_1(pretrained=True, num_classes=1000)
        m.classifier[1] = nn.Conv2d(m.classifier[1].in_channels,
                                    outdim,
                                    kernel_size=(1, 1),
                                    stride=(1, 1))
    elif model['model_type'] == 'ResNet':
        m = models.resnet50(pretrained=True, num_classes=1000)
        m.fc = nn.Linear(m.fc.in_features, outdim, bias=True)
    elif model['model_type'] == 'DenseNet':
        m = models.densenet161(pretrained=True, num_classes=1000)
        m.classifier = nn.Linear(m.classifier.in_features,
                                 outdim,
                                 bias=True)
    elif model['model_type'] == 'AlexNet':
        m = models.alexnet(pretrained=True, num_classes=1000)
        m.classifier[-1] = nn.Linear(m.classifier[-1].in_features,
                                     outdim, bias=True)
    elif model['model_type'] == 'VGG':
        m = models.vgg16(pretrained=True, num_classes=1000)
        m.classifier[-1] = nn.Linear(m.classifier[-1].in_features,
                                     outdim, bias=True)

    assert m != None, 'Model Not Initialized'
    return m


def init_optimizer(optimizer, model):
    opt = None
    lr = optimizer['lr']
    weight_decay = optimizer['weight_decay']
    parameters = model.parameters()
    if optimizer['optim_type'] == 'Adam':
        opt = optim.Adam(parameters,
                         lr=lr,
                         weight_decay=weight_decay)
    elif optimizer['optim_type'] == 'Adadelta':
        opt = optim.Adadelta(parameters,
                             lr=lr,
                             weight_decay=weight_decay)
    else:
        opt = optim.RMSprop(parameters,
                            lr=lr,
                            weight_decay=weight_decay)

    assert opt != None, 'Optimizer Not Initialized'
    return opt
