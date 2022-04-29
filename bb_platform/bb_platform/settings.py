"""
Django settings for bb_platform project.

Generated by 'django-admin startproject' using Django 3.1.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""

import os
import sys
import time
import logging

from pathlib import Path
from decouple import config
from logging.config import dictConfig

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve(strict=True).parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
ENV = config('ENV', default='Dev')
if ENV == 'Dev':
    DEBUG = True
else:
    DEBUG = False


ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split()

# CORS settings

CORS_ORIGIN_ALLOW_ALL = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
CORS_URLS_REGEX = r'^/api/.*$'

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'projects',
    'rest_framework',
    'knox',
    'drf_yasg',
    'accounts',
    'datasets',
    'pytorch',
    'processes'
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('knox.auth.TokenAuthentication',),
    'DEFAULT_PAGINATION_CLASS': 'bb_platform.pagination.CustomPagination',
    'PAGE_SIZE': 5
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'bb_platform.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'bb_platform.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Logging

PROJECT = ROOT_URLCONF.split('.')[0]

LOG_LEVEL = config('LOG_LEVEL', default='INFO')
LOG_FILENAME = config('LOG_FILENAME', default=f'{PROJECT}.log')

TZ = time.strftime('%z')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format':
            f'[%(asctime)s {TZ}] [%(name)s] [%(levelname)s] [%(threadName)s] [%(filename)s:%(lineno)d] [%(funcName)s] %(message)s'
        },
        'simple': {
            'format':
            f'[%(asctime)s {TZ}] [%(name)s] [%(levelname)s] %(message)s'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'stream': sys.stdout,
            'formatter': 'verbose' if LOG_LEVEL == 'DEBUG' else 'simple'
        },
        'file': {
            'class': 'logging.FileHandler',
            'formatter': 'verbose',
            'filename': LOG_FILENAME,
            'level': LOG_LEVEL
        }
    },
    'loggers': {
        PROJECT: {
            'handlers': ['console'],
            'level': LOG_LEVEL,
        },
        'django.server': {
            'handlers': ['console'],
            'level': LOG_LEVEL,
        },
    },
}

dictConfig(LOGGING)

LOGGER = logging.getLogger(PROJECT)


# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

STATIC_URL = '/static/'
# Save uploaded images
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = '587'
EMAIL_HOST_USER = 'autumn5816@gmail.com'
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False


###=====================================###
###  Database file-based configuration  ###
###=====================================###
# Status
ACTIVE = config('ACTIVE', cast=int)
INACTIVE = config('INACTIVE', cast=int)
DELETE = config('DELETE', cast=int)

# Platform
BLACKBIRD = config('BLACKBIRD', cast=int)
PMROBOT = config('PMROBOT', cast=int)

# Structure
DEFAULT_STRUCTURE = config('DEFAULT', cast=int)
VARIANT1_STRUCTURE = config('VARIANT1', cast=int)

# Dataset mode
TRAINING = config('TRAINING', cast=int)
VALIDATION = config('VALIDATION', cast=int)
INFERENCE = config('INFERENCE', cast=int)

# Annotation format
LABELBOX = config('LABELBOX', cast=int)
VIA = config('VIA', cast=int)
MATLAB = config('MATLAB', cast=int)

# Model type
SQUEEZENET = config('SQUEEZENET', cast=int)
GOOGLENET = config('GOOGLENET', cast=int)
RESNET = config('RESNET', cast=int)
VGG = config('VGG', cast=int)
ALEXNET = config('ALEXNET', cast=int)

# Model category
CLASSIFICATION = config('CLASSIFICATION', cast=int)
DETECTION = config('DETECTION', cast=int)
SEGMENTATION = config('SEGMENTATION', cast=int)

# Metric func
# PIXEL1 without mask, PIXEL2 with mask
PATCH = config('PATCH', cast=int)
PIXEL1 = config('PIXEL1', cast=int)
PIXEL2 = config('PIXEL2', cast=int)

# Metric category
SEVERITY = config('SEVERITY', cast=int)

# Saliency func
GRADCAM = config('GRADCAM', cast=int)
GRADIENT = config('GRADIENT', cast=int)

# Global dictionary
STATUS_DICT = {ACTIVE: 'active', INACTIVE: 'inactive', DELETE: 'delete'}

PLATFORM_DICT = {BLACKBIRD: 'BlackBird', PMROBOT: 'PMRobot'}

STRUCTURE_DICT = {DEFAULT_STRUCTURE: 'default', VARIANT1_STRUCTURE: 'variant1'}

DATASET_MODE_DICT = {TRAINING: 'Training',
                     VALIDATION: 'Validation', INFERENCE: 'Inference'}

ANNOTATION_DICT = {LABELBOX: 'labelbox', VIA: 'via', MATLAB: 'matlab'}

from pytorch.converter import via, labelbox, matlab
ANNOTATION_CONVERTER_DICT = {
    LABELBOX: labelbox.converter, VIA: via.converter, MATLAB: matlab.converter}

MODEL_TYPE_DICT = {SQUEEZENET: 'SqueezeNet', GOOGLENET: 'GoogleNet',
                   RESNET: 'ResNet', VGG: 'VGG', ALEXNET: 'AlexNet'}

MODEL_CATEGORY = {CLASSIFICATION: 'classification',
                  DETECTION: 'detection', SEGMENTATION: 'segmentation'}

METRIC_FUNC = {PATCH: 'patch', PIXEL1: 'pixel1', PIXEL2: 'pixel2'}

SALIENCY_FUNC = {GRADCAM: 'GradCAM', GRADIENT: 'Gradient'}

METRIC_CATEGORY = {SEVERITY: 'severity_rate'}
