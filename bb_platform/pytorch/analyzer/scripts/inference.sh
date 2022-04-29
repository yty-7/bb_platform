#!/bin/sh

pipenv run python3 /home/tq42/BB_analysis/code/classification/inference.py      \
                                         --dataset_path  /mnt/cornell/Data/tq42/Hyphal_2019   \
                                         --model_path  /mnt/cornell/Data/tq42/Hyphal_2019      \
                                         --model_type SqueezeNet                               \
                                         --loading_epoch 190                                   \
                                         --cuda                                                \
                                         --timestamp Jun24_21-10-46                            
