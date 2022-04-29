from projects.models import Project, ProjectMeta, Data
from projects.utils import make_dirs, remove_dirs
from projects.serializers import ProjectMetaSerializer, DataSerializer

from datasets.models import DatasetMeta

from processes.models import Process

from django.conf import settings

from rest_framework.response import Response
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework import permissions, status

logger = settings.LOGGER


class DataListView(ListAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = DataSerializer

    def get(self, request, pk=None):
        """
            Retrieve intermedia data table corresponding to the current project
        Args:
            pk:      A project meta's primary key
        """
        project_id = Project.objects.filter(
            project_meta_id=pk).values_list('id', flat=True)[0]
        data_queryset = Data.objects.filter(project_id=project_id)
        serializer = self.get_serializer(data_queryset, many=True)

        return Response(serializer.data)


class ProjectMetaCreateListView(ListCreateAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = ProjectMetaSerializer

    def get_queryset(self):
        return self.request.user.projectsmeta.all().order_by('id')

    def get(self, request, *args, **kwargs):
        """
            Get project meta instances list
        """
        return super().get(request, *args, **kwargs)

    def post(self, request):
        """
            Create a new project meta
        """
        serializer = self.get_serializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            # Make dirs
            instance = serializer.save(owner=self.request.user)
            project_root_path = instance.root_path
            make_dirs(project_root_path)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        logger.debug(f'Serialize error: {serializer.errors}')
        logger.debug(f'Serialize data: {serializer.data}')

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectMetaUpdateView(RetrieveUpdateDestroyAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = ProjectMetaSerializer

    def get_queryset(self):
        return self.request.user.projectsmeta.all().order_by('id')

    def put(self, request, *args, **kwargs):
        """
            Update project meta partailly or completely
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance,
                                         data=request.data,
                                         partial=True)
        if serializer.is_valid():
            # Update datasets many to many relationship
            project = instance.project
            dataset_ids = project.datasets.values_list('id', flat=True)
            new_dataset_ids = serializer.validated_data['dataset_ids']

            add_ids = list(set(new_dataset_ids) - set(dataset_ids))
            remove_ids = list(set(dataset_ids) - set(new_dataset_ids))

            if add_ids:
                project.datasets.add(*add_ids)
            if remove_ids:
                project.datasets.remove(*remove_ids)

            # Update process foreign key relationship
            process_id = project.process.id if project.process else -1
            new_process_id = serializer.validated_data.get('process_id', None)
            if new_process_id:
                if process_id != new_process_id:
                    Project.objects.filter(id=project.id).update(
                        process=Process.objects.get(id=new_process_id))

            serializer.save()
            return Response(serializer.data)

        logger.debug(f'Serialize error: {serializer.errors}')
        logger.debug(f'Serialize data: {serializer.data}')

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        """
            Delete project meta
        """
        instance = self.get_object()
        # Remove dirs
        remove_dirs(instance)
        return super().delete(request, *args, **kwargs)
