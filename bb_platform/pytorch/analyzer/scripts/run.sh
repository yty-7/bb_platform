#!/bin/sh

pipenv run python3 /home/tq42/BB_analysis/code/classification/run.py      \
                                         --root_path  /mnt/cornell/Data/tq42/Hyphal_2020 \
                                         --model_type AlexNet        \
                                         --loading_epoch 0           \
                                         --total_epochs 200          \
                                         --cuda                      \
                                         --optimType Adadelta        \
                                         --lr 1e-3                   \
                                         --bsize 64                  \
                                         --nworker 4                 \
                                         --cuda_device 0

