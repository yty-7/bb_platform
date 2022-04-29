import os
from pathlib import Path
from collections import OrderedDict

from processes.models import PyTorchModel, MetricFunc, ProcessMeta, Process
from processes.serializers import PyTorchModelSerializer, MetricFuncSerializer, ProcessMetaSerializer

from projects.models import ProjectMeta, Project, Data
from datasets.models import DatasetMeta, Dataset
from datasets.utils import remove_dirs, extract_filename

from django.conf import settings

from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework import permissions, status
from rest_framework.settings import api_settings

logger = settings.LOGGER


class MetricFuncCreateListView(ListCreateAPIView):
    serializer_class = MetricFuncSerializer
    queryset = MetricFunc.objects.all().order_by('id')

    def get_permissions(self):
        """
            Instantiates and returns the list of permissions that this view requires.
        """
        if self.request.method == 'GET':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def post(self, request):
        """
            Create a new metric function
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        logger.debug(f'Serialize error: {serializer.errors}')
        logger.debug(f'Serialize data: {serializer.data}')

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MetricFuncUpdateView(RetrieveUpdateDestroyAPIView):
    permission_classes = [
        permissions.IsAdminUser
    ]
    serializer_class = MetricFuncSerializer
    queryset = MetricFunc.objects.all().order_by('id')

    def get_permissions(self):
        """
            Instantiates and returns the list of permissions that this view requires.
        """
        if self.request.method == 'GET':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def put(self, request, *args, **kwargs):
        """
            Update metric function partailly or completely
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance,
                                         data=request.data,
                                         partial=True)
        if serializer.is_valid():
            new_filepath = serializer.validated_data.get('filepath', None)
            # Remove the original model file if uploaded a new one
            if new_filepath:
                old_filepath = instance.filepath.path
                remove_dirs(instance)
                logger.info(f'Removed {old_filepath} and Add {new_filepath}')

            serializer.save()
            return Response(serializer.data)

        logger.debug(f'Serialize error: {serializer.errors}')
        logger.debug(f'Serialize data: {serializer.data}')

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        """
            Delete metric function
        """
        instance = self.get_object()
        # Remove dirs
        remove_dirs(instance)
        return super().delete(request, *args, **kwargs)


class PyTorchModelCreateListView(ListCreateAPIView):
    serializer_class = PyTorchModelSerializer
    queryset = PyTorchModel.objects.all().order_by('id')

    def get_permissions(self):
        """
            Instantiates and returns the list of permissions that this view requires.
        """
        if self.request.method == 'GET':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def post(self, request):
        """
            Create a new pytorch model
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        logger.debug(f'Serialize error: {serializer.errors}')
        logger.debug(f'Serialize data: {serializer.data}')

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PyTorchModelUpdateView(RetrieveUpdateDestroyAPIView):
    permission_classes = [
        permissions.IsAdminUser
    ]
    serializer_class = PyTorchModelSerializer
    queryset = PyTorchModel.objects.all().order_by('id')

    def get_permissions(self):
        """
            Instantiates and returns the list of permissions that this view requires.
        """
        if self.request.method == 'GET':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

    def put(self, request, *args, **kwargs):
        """
            Update pytorch model partailly or completely
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance,
                                         data=request.data,
                                         partial=True)
        if serializer.is_valid():
            new_filepath = serializer.validated_data.get('filepath', None)
            # Remove the original model file if uploaded a new one
            if new_filepath:
                old_filepath = instance.filepath.path
                remove_dirs(instance)
                logger.info(f'Removed {old_filepath} and Add {new_filepath}')

            serializer.save()
            return Response(serializer.data)

        logger.debug(f'Serialize error: {serializer.errors}')
        logger.debug(f'Serialize data: {serializer.data}')

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        """
            Delete pytorch model
        """
        instance = self.get_object()
        # Remove dirs
        remove_dirs(instance)
        return super().delete(request, *args, **kwargs)


class ProcessMetaCreateListView(ListCreateAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = ProcessMetaSerializer

    def get_queryset(self):
        return self.request.user.processesmeta.all().order_by('id')

    def get(self, request, *args, **kwargs):
        """
            Get process meta instances list w/wi pagination
        """
        queryset = self.filter_queryset(self.get_queryset())

        page_num = self.request.query_params.get('page', None)
        page = self.paginate_queryset(queryset)
        if page is not None and page_num is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(OrderedDict([
            ('count', len(serializer.data)),
            ('page_size', api_settings.PAGE_SIZE),
            ('results', serializer.data)
        ]))

    def post(self, request):
        """
            Create a new process meta
        """
        serializer = self.get_serializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(owner=self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        logger.debug(f'Serialize error: {serializer.errors}')
        logger.debug(f'Serialize data: {serializer.data}')

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProcessMetaUpdateView(RetrieveUpdateDestroyAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = ProcessMetaSerializer

    def get_queryset(self):
        return self.request.user.processesmeta.all().order_by('id')

    def put(self, request, *args, **kwargs):
        """
            Update process meta partailly or completely
        """
        # partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance,
                                         data=request.data,
                                         partial=True)
        if serializer.is_valid():
            # Update many to many relationship
            metric_func_ids = instance.metric_funcs.values_list(
                'id', flat=True)
            new_metric_func_ids = serializer.validated_data['metric_func_ids']

            add_ids = list(set(new_metric_func_ids) - set(metric_func_ids))
            remove_ids = list(set(metric_func_ids) - set(new_metric_func_ids))

            if add_ids:
                instance.metric_funcs.add(*add_ids)
            if remove_ids:
                instance.metric_funcs.remove(*remove_ids)

            serializer.save()
            return Response(serializer.data)

        logger.debug(f'Serialize error: {serializer.errors}')
        logger.debug(f'Serialize data: {serializer.data}')

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        """
            Delete process meta
        """
        return super().delete(request, *args, **kwargs)


class ProjectProcessListView(RetrieveAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = ProcessMetaSerializer

    def get(self, request, pk=None):
        """
            Retrieve the process corresponding to the current project
        Args:
            pk:      A project meta's primary key
        """
        instance = ProjectMeta.objects.get(id=pk)
        process = instance.project.process

        if process:
            queryset = process.process_meta
            serializer = self.get_serializer(queryset)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_200_OK)


class ProcessModelListView(RetrieveAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = PyTorchModelSerializer

    def get(self, request, pk=None):
        """
            Retrieve the model corresponding to the current process
        Args:
            pk:      A process meta's primary key
        """
        instance = ProcessMeta.objects.get(id=pk)
        model = instance.pytorch_model

        if model:
            queryset = model
            serializer = self.get_serializer(queryset)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_200_OK)


class ProcessMetricListView(ListAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = MetricFuncSerializer

    def get(self, request, pk=None):
        """
            Retrieve metrics corresponding to the current process
        Args:
            pk:      A process meta's primary key
        """
        instance = ProcessMeta.objects.get(id=pk)
        queryset = instance.metric_funcs.order_by('id')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
