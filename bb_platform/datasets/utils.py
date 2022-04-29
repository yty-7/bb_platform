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
    filepath = Path(instance.filepath.path)
    file_folder = filepath.parent
    try:
        shutil.rmtree(file_folder)
        logger.info(f'Removed {file_folder}')
    except Exception as e:
        logger.debug(f'Remove dir error: {e}')
        logger.debug(f'Directory: {file_folder}')


def extract_filename(raw_filepath, regex='media'):
    """
        Retrieve the relative filepath
    Args:
        raw_filepath:          Filepath stored in the database
        regex:                 Regex expression
    """
    path_pattern = re.compile(r'{}/.*'.format(regex))
    return path_pattern.search(raw_filepath).group()


def unzip_file(instance, valid_filepath, errors):
    """
        Unzip .zip file
    """
    file_root_folder = Path(valid_filepath).parent
    extracted_root_folder = file_root_folder / 'extract'

    try:
        with ZipFile(valid_filepath, 'r') as zip_ref:
            zip_ref.extractall(extracted_root_folder)
        logger.info(f'Extraction to {extracted_root_folder} success')

        return extracted_root_folder
    except Exception as e:
        logger.debug(f'Unzip error: {e}')
        remove_dirs(instance)
        instance.delete()
        # Unzipped failed
        errors['validation'] = 'Unzipped failed.'
        raise ValidationError(errors)


def validate_name_convention(instance, valid_name, extracted_name, errors):
    """
        Validate folder or file naming convention
    Args:
        instance:               A newly created instance
        valid_name:             Correct nameing convention
        extracted_name:         Extracted folder/file's naming convention
        errors:                 An orderedDict object
    """
    invalid_extracted_folder_name = list(
        set(valid_name) - set(extracted_name))

    if invalid_extracted_folder_name:
        remove_dirs(instance)
        instance.delete()
        errors['validation'] = 'Naming convention does not match the mode.'

        logger.debug('Validation error')
        logger.debug(
            f'Naming convention does not match the mode. {invalid_extracted_folder_name} is needed.')
        raise ValidationError(errors)


def validate_folder_file_itself(instance, folder_file_path, errors, type_):
    """
        Validate file is file and folder is folder
    Args:
        instance:               A newly created instance
        folder_file_path:       Absolute path
        errors:                 An orderedDict object
        type_:                  Either folder or file
    """
    validator = {'folder': os.path.isdir, 'file': os.path.isfile}
    if not validator[type_](folder_file_path):
        remove_dirs(instance)
        instance.delete()
        errors['validation'] = f'{folder_file_path} should be a {type_}.'

        logger.debug('Validation error')
        logger.debug(f'{folder_file_path} should be a {type_}.')
        raise ValidationError(errors)


def converter_handler(instance, folder_path, subfolder_name, converter, daemon=True):
    """
        Create a thread runing the converter and catch errors that might occur during conversion
    Args:
        instance:                  A newly created instance
        folder_path:               /media/datasets/user1/dataset1/extract/Training/
        subfolder_name:            ['Tray1', 'Tray2']
        converter:                 One of the three converters
    """

    converter_thread = threading.Thread(target=converter, args=(
        folder_path, subfolder_name, instance,), daemon=daemon)
    converter_thread.start()


def integrity_check(instance):
    """
        Integrity check including naming convention and file structure
    Args:
        instance:      A newly created instance
    """

    raw_filepath = instance.filepath.path
    mode = instance.mode
    annotation = instance.annotation
    structure = instance.structure

    dataset_mode_dict = settings.DATASET_MODE_DICT
    annotation_converter_dict = settings.ANNOTATION_CONVERTER_DICT

    # Return errors
    errors = OrderedDict()

    if mode in dataset_mode_dict.keys():
        valid_folder_name = [dataset_mode_dict[mode]]

        valid_filepath = extract_filename(raw_filepath)
        extracted_root_folder = unzip_file(instance, valid_filepath, errors)

        # Should be Training/Validation/Inference (ignore other invalid files in case)
        extracted_folder_name = [f for f in os.listdir(
            extracted_root_folder) if f in dataset_mode_dict.values()]

        # Directories should match the mode
        validate_name_convention(
            instance, valid_folder_name, extracted_folder_name, errors)

        # All the first-level objects should be directories
        for data_folder_name in extracted_folder_name:
            data_folder_path = os.path.join(
                extracted_root_folder, data_folder_name)
            validate_folder_file_itself(
                instance, data_folder_path, errors, type_='folder')

            # Check metadata file and raw images
            if structure == settings.DEFAULT_STRUCTURE:
                # Should be Tray1, Tray2, ...
                extracted_subfolder_name = [f for f in os.listdir(data_folder_path) if os.path.isdir(
                    os.path.join(data_folder_path, f)) and not f.startswith('__MACOSX')]

                # Check each subdirectory
                for subfolder_name in extracted_subfolder_name:
                    subfolder_path = os.path.join(
                        data_folder_path, subfolder_name)
                    extracted_file_name = [f for f in os.listdir(
                        subfolder_path) if not f.startswith('__MACOSX') and not f.startswith('.DS_Store')]

                    # Inference folders do not need HDF5 conversion
                    if data_folder_name == 'Inference':
                        valid_file_name = ['images']

                        validate_name_convention(
                            instance, valid_file_name, extracted_file_name, errors)

                        # Check images is directory
                        file_path = os.path.join(
                            subfolder_path, extracted_file_name[0])
                        validate_folder_file_itself(
                            instance, file_path, errors, type_='folder')
                    else:
                        valid_file_name = ['metadata.csv', 'images'] if annotation == 2 else [
                            'annotation.json', 'images']

                        validate_name_convention(
                            instance, valid_file_name, extracted_file_name, errors)

                        # Check annotation is file and images is directory
                        for file_name in extracted_file_name:
                            file_path = os.path.join(
                                subfolder_path, file_name)
                            if file_name == valid_file_name[0]:
                                validate_folder_file_itself(
                                    instance, file_path, errors, type_='file')
                            elif file_name == valid_file_name[1]:
                                validate_folder_file_itself(
                                    instance, file_path, errors, type_='folder')

                        # Call annotation converter using Threading running in the background
                        annotation_converter = annotation_converter_dict[annotation]
                        converter_handler(
                            instance, data_folder_path, extracted_subfolder_name, annotation_converter)
            else:
                remove_dirs(instance)
                instance.delete()
                errors['message'] = 'Not yet support this mode.'

                logger.debug('Validation error')
                logger.debug(f'Specified structure: {structure}')
                raise ValidationError(errors)
    else:
        remove_dirs(instance)
        instance.delete()
        # Unzipped failed
        errors['validation'] = 'Please at least specify one mode'

        logger.debug('Validation error')
        logger.debug(f'Specified mode: {mode}')
        raise ValidationError(errors)
