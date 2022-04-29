## Classification Component

This is the classification component for PM/BlackBird robots. Programs that are used to train models and do inference are stored in this folder.

### Data Preparation

The data are stored by HDF5 so they are simply imported using Python *h5py* library in the **dataloader.py** file. We hope the raw data can be always processed in the similar way in the further development

### Running

The training and validation process are executed in the **solver.py** file while the entry point is the **run.py** file, where the logger, the dataloader, and the solver are instanciated


#### Training

Training a model from scratch is quite simple, just specify the below arguments such as pretrained model type, optimizer type, and other hpyerparameters in the **run.sh** file

```Python
#! run.sh

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

```

Resume training models is also not too much difficult. Since the logs and models are organized as the following structure, where each time we run experiments, these three folders will be made with the almost same filename. 

```console
BB_analysis/
└── results
    ├── logs
    │   ├── DenseNet_Jun04_21-09-01
    │   ├── GoogleNet_Jun05_21-31-54
    │   ├── ResNet_Jun04_21-04-42
    │   └── SqueezeNet_Jun04_18-18-46
    ├── models
    │   ├── DenseNet_Jun04_21-09-01
    │   ├── GoogleNet_Jun05_21-31-54
    │   ├── ResNet_Jun04_21-04-42
    │   └── SqueezeNet_Jun04_18-18-46
    └── runs
        ├── DenseNet_Jun04_21-09-01_cornell-rbtg
        ├── GoogleNet_Jun05_21-31-54_cornell-rbtg
        ├── ResNet_Jun04_21-04-42_cornell-rbtg
        └── SqueezeNet_Jun04_18-18-46_cornell-rbtg
```

Therefore, as we would like to resume training from certain checkpoint, we only need to configure the **run.sh** file like this:

```Python
#! run.sh

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
                                        ###
                                        --resume                                \
                                        --resume_timestamp {timestamp}          \
                                        --loading_epoch {epoch}                 \
                                        ###
```

#### Inference

Inference can be easily done by running **inference.py** file as follows:

```Python
#! inference.sh

pipenv run python3 /home/tq42/BB_analysis/code/classification/inference.py      \
                                         --dataset_path  /mnt/cornell/Data/tq42/Hyphal_2019   \
                                         --model_path  /mnt/cornell/Data/tq42/Hyphal_2019      \
                                         --model_type SqueezeNet                               \
                                         --loading_epoch 190                                   \
                                         --cuda                                                \
                                         --timestamp Jun24_21-10-46   
```

The **dataset_path** and **model_path** arguments should be specified separately in the consideration of cross-dataset validation.

