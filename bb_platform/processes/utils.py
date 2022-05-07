import os
import re
import json
import shutil
import threading
from pathlib import Path
from zipfile import ZipFile
from collections import OrderedDict

from pytorch.converter import via, labelbox, matlab

from django.conf import settings

from rest_framework.exceptions import ValidationError

logger = settings.LOGGER

def remove_dirs(instance):
    """
        Remove the instance's directory accordingly
    """
    #filepath = Path(instance.filepath.path)
    #file_folder = filepath.parent
    filepath =f'{os.getcwd()}/media/{instance.filepath}'
    filepath = filepath.rsplit('/', 1)[0]
    # file_folder = filepath.parent
    try:
        # shutil.rmtree(file_folder)
        # logger.info(f'Removed {file_folder}')
        # os.remove(filepath) 
        shutil.rmtree(filepath)
        logger.info(f'Removed {filepath}')
    except Exception as e:
        logger.debug(f'Remove dir error: {e}')
        #logger.debug(f'Directory: {file_folder}')
        logger.debug(f'Directory: {filepath}')