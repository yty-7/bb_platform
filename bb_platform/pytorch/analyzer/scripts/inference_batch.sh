#!/bin/bash

###---------
## Do batch inference using different models
###---------

script_path="/home/tq42/BB_analysis/code/classification/inference.py"
hyphal19="/mnt/cornell/Data/tq42/Hyphal_2019"
hyphal20="/mnt/cornell/Data/tq42/Hyphal_2020"

# 2020 train: epochs("200" "200" "200" "200" "200") timestamp ("Jul30_03-32-17" "Jul29_22-03-10" "Jul28_18-15-55" "Jul29_22-02-25" "Jul30_03-29-51")
# 2019 train: epochs("181" "200" "200" "140" "200") timestamp ("Jul29_21-18-25" "Jul29_22-04-43" "Jul29_18-19-46" "Jul29_21-15-32" "Jul30_03-29-13")
declare -a models=("AlexNet" "SqueezeNet" "GoogleNet" "ResNet" "VGG")
declare -a epochs=("200" "200" "200" "200" "200")
declare -a timestamps=("Jul29_21-18-25" "Jul29_22-04-43" "Jul29_18-19-46" "Jul29_21-15-32" "Jul30_03-29-13")
len=${#models[@]}

for((i=0;i<$len;i++))
do
    dataset_path=$hyphal19
    model_path=$hyphal19
    model=${models[$i]}
    epoch=${epochs[$i]}
    timestamp=${timestamps[$i]}
    echo "pipenv run python3 $script_path --dataset_path $dataset_path --model_path $model_path --model_type $model --loading_epoch $epoch --timestamp $timestamp --cuda"
    # pipenv run python3 $script_path --dataset_path $dataset_path --model_path $model_path --model_type $model --loading_epoch $epoch --timestamp $timestamp --cuda
done