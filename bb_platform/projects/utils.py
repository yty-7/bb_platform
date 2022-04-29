import os
import shutil
from datetime import datetime

from django.conf import settings


def make_dirs(project_root_path):
    """
        Create project root folder
    """
    os.makedirs(project_root_path, exist_ok=True)
    print(f'Created {project_root_path}')


def remove_dirs(instance):
    """
        Remove the instance's directory accordingly
    """
    project_root_path = instance.root_path
    try:
        # os.remove(filepath)
        # file_dir.rmdir()
        shutil.rmtree(project_root_path)
        print(f'Removed {project_root_path}')
    except:
        pass
