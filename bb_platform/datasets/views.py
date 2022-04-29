import os
from collections import OrderedDict

from datasets.models import DatasetMeta
from datasets.serializers import DatasetMetaSerializer
from datasets.utils import remove_dirs, integrity_check

from projects.models import ProjectMeta

from django.conf import settings

from rest_framework.response import Response
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework import permissions, status
from rest_framework.settings import api_settings
from rest_framework.decorators import api_view

logger = settings.LOGGER


class DatasetMetaCreateListView(ListCreateAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = DatasetMetaSerializer

    def get_queryset(self):
        return self.request.user.datasetsmeta.all().order_by('id')

    def get(self, request, *args, **kwargs):
        """
            Get dataset meta instances list w/wi pagination
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
            Create a new dataset meta
        """

        filepath = request.data['filepath']
        logger.info(
            f'New request from: {self.request.user} with requested data: {filepath}')

        serializer = self.get_serializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            instance = serializer.save(owner=self.request.user)
            integrity_check(instance)
            logger.info(
                f'Finished request from {self.request.user} with requested data {instance.filepath}')
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        logger.debug(f'Serialize error: {serializer.errors}')
        logger.debug(f'Serialize data: {serializer.data}')

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DatasetMetaUpdateView(RetrieveUpdateDestroyAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = DatasetMetaSerializer

    def get_queryset(self):
        return self.request.user.datasetsmeta.all().order_by('id')

    def put(self, request, *args, **kwargs):
        """
            Update dataset meta partailly or completely
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance,
                                         data=request.data,
                                         partial=True)
        if serializer.is_valid():
            new_filepath = serializer.validated_data['filepath']
            # Remove the original file if uploaded a new file
            if new_filepath:
                old_filepath = instance.filepath.path
                os.remove(old_filepath)
                logger.info(f'Removed {old_filepath} and Add {new_filepath}')

            serializer.save()
            return Response(serializer.data)

        logger.debug(f'Serialize error: {serializer.errors}')
        logger.debug(f'Serialize data: {serializer.data}')

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        """
            Delete dataset meta
        """
        instance = self.get_object()
        # Remove dirs
        remove_dirs(instance)
        return super().delete(request, *args, **kwargs)


class ProjectDatasetListView(ListAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = DatasetMetaSerializer

    def get(self, request, pk=None):
        """
            Retrieve datasets corresponding to the current project
        Args:
            pk:      A project meta's primary key
        """
        instance = ProjectMeta.objects.get(id=pk)
        dataset_ids = instance.project.datasets.values_list('id', flat=True)
        queryset = DatasetMeta.objects.filter(
            dataset__in=dataset_ids).order_by('id')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def query_status(request, pk=None):
    """
        Query the status of the process
    Args:
        pk:      A project meta's primary key    
    Return:
        Status
    """

    project_meta = ProjectMeta.objects.get(id=pk)

    ret = OrderedDict()
    ret['status'] = project_meta.project.data_set.values_list('status', flat=True)[
        0]

    return Response(ret, status=status.HTTP_200_OK)
