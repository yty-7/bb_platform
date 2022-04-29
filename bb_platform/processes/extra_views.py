import os
import json
import pandas as pd
from pathlib import Path
from collections import OrderedDict

from processes.models import PyTorchModel, MetricFunc, ProcessMeta, Process

from projects.models import ProjectMeta, Project, Data
from datasets.models import DatasetMeta, Dataset
from datasets.utils import extract_filename

from django.conf import settings
from django.core.mail import send_mail

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError

from pytorch.analyzer.analyzer import analyzer

logger = settings.LOGGER


@api_view(['POST'])
def run_process(request, pk=None):
    """
        Run process (training, validation, or inference)
    """

    try:
        project_meta = ProjectMeta.objects.get(id=request.data['project_id'])
        dataset_meta = DatasetMeta.objects.get(id=request.data['dataset_id'])
        process_meta = ProcessMeta.objects.get(id=request.data['process_id'])
        project_dataset_data = Data.objects.get(
            project=project_meta.project, dataset=dataset_meta.dataset)
    except Exception as e:
        logger.debug(f'Run process error: {e}')
        logger.debug(f'Requested data: {request.data}')

        return Response(status=status.HTTP_404_NOT_FOUND)

    dataset_mode_dict = settings.DATASET_MODE_DICT
    mode = dataset_meta.mode

    if dataset_mode_dict[mode] == 'Training':
        email_subject = 'Testing Django'
        email_content = 'Email sent from Django'
        sender = 'autumn5816@gmail.com'
        receivers = ['tq42@cornell.edu']

        send_mail(email_subject, email_content, sender,
                  receivers, fail_silently=False,)
        project_dataset_data.image_output_zip_path = extract_filename(
            dataset_meta.filepath.path)
        project_dataset_data.status = 'D'
        project_dataset_data.save()

        logger.info(
            f'Send training requests email from {sender} to {receivers}')
    else:
        dataset_main_folder = Path(dataset_meta.filepath.path).parent
        dataset_folder = dataset_main_folder / 'extract' / 'Inference'

        if not os.path.exists(dataset_folder):
            logger.debug('Run process error')
            logger.debug(f'Not found {dataset_folder}')

            errors = OrderedDict()
            errors['validation'] = 'Not found inference folder'
            raise ValidationError(errors)

        # Output folder
        project_main_folder = project_meta.root_path
        output_folder = os.path.join(
            project_main_folder, f'dataset_{dataset_meta.id}')
        if not os.path.exists(output_folder):
            os.mkdir(output_folder)
            logger.info('Run process info')
            logger.info(f'Created {output_folder}')

        # Model type
        model_type_dict = settings.MODEL_TYPE_DICT
        model_type = model_type_dict[process_meta.pytorch_model.model_type]

        # Leaf disc masking threshold
        rel_th = 0.1 if dataset_meta.platform == settings.BLACKBIRD else 0.2

        # Model path
        pytorch_model_filepath = process_meta.pytorch_model.filepath.path

        # Metric funcs
        metric_funcs = process_meta.metric_funcs.all()

        # Saliency methods
        saliency_methods = json.loads(process_meta.viz_tech)
        
        # CUDA status checking????

        opt = {
            'outdim': 2,
            'cuda': True,
            'cuda_id': 0,
            'target_class': 1,
            'rel_th': rel_th,
            'model_type': model_type,
            'output_folder': output_folder,
            'dataset_folder': dataset_folder,
            'model_filepath': pytorch_model_filepath,
            'metric_funcs': metric_funcs,
            'saliency_methods': saliency_methods
        }

        import threading

        analyzer_thread = threading.Thread(
            target=analyzer, args=(opt, project_dataset_data,), daemon=True)
        analyzer_thread.start()

    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
def display_image(request, pk=None):
    """
        Display images in frontend
    Return:
        Images url
    """

    try:
        project_meta = ProjectMeta.objects.get(id=request.data['project_id'])
        dataset_meta = DatasetMeta.objects.get(id=request.data['dataset_id'])
        process_meta = ProcessMeta.objects.get(id=request.data['process_id'])
        project_dataset_data = Data.objects.get(
            project=project_meta.project, dataset=dataset_meta.dataset)
    except Exception as e:
        logger.debug(f'Display image error: {e}')
        logger.debug(f'Requested data: {request.data}')

        return Response(status=status.HTTP_404_NOT_FOUND)

    ret = OrderedDict()

    # Output folder
    image_output_folder = project_dataset_data.image_output_folder

    tray_folders = [f for f in os.listdir(image_output_folder) if os.path.isdir(
        os.path.join(image_output_folder, f)) and not f.startswith('__MACOSX')]

    # Metric funcs
    metric_func_dict = settings.METRIC_FUNC
    metric_funcs = process_meta.metric_funcs.values_list(
        'metric_func', flat=True)
    metrics = [metric_func_dict[x] for x in metric_funcs]

    for tray_folder in tray_folders:
        tray_image_folder = os.path.join(image_output_folder, tray_folder)
        tray_csv_folder = tray_image_folder.replace('images', 'files')

        ret[tray_folder] = {}

        images = os.listdir(tray_image_folder)
        csv_filepath = os.path.join(tray_csv_folder, 'severity-rate.csv')
        csv_file = pd.read_csv(csv_filepath)

        for _, row in csv_file.iterrows():
            filename = row['filename']

            ret[tray_folder][filename] = {}
            for metric in metrics:
                ret[tray_folder][filename][metric] = row[metric]
            # For frontend
            ret[tray_folder][filename]['metrics'] = metrics

        for _, image in enumerate(images):
            # Split by a predefined special char
            image_name_strs = os.path.splitext(image)[0].split('-with-')
            filename = image_name_strs[0]
            image_list = ret[tray_folder][filename].get('images', [])
            if image_list:
                ret[tray_folder][filename]['images'].append(
                    os.path.join(tray_image_folder, image))
            else:
                ret[tray_folder][filename]['images'] = [
                    os.path.join(tray_image_folder, image)]
                # ret[tray_folder][filename]['images'] = 'bb_platform/media/projects/user_3/project_97/dataset_146/images/Tray/1-B9_cinerea-with-GradCam.png'

    return Response(ret, status=status.HTTP_200_OK)
