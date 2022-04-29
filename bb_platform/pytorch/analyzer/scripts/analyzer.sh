#!/bin/sh

time pipenv run python3 /home/tq42/BB_analysis/code/analyzer.py \
                 --model_type SqueezeNet                           \
                 --model_path /mnt/cornell/Data/tq42/Hyphal_2019   \
                 --dataset_path /mnt/cornell/Data/tq42/Hyphal_2019 \
                 --loading_epoch 190                               \
                 --target_class 1                                  \
                 --cuda                                            \
                 --cuda_id 0                                       \
                 --timestamp Jul29_22-04-43