import os

from django.conf import settings
from django.db import models
from django.contrib.auth.models import User

from datasets.models import Dataset, DatasetMeta
from processes.models import Process


class ProjectMetaManager(models.Manager):
    def create(self, name, date, location, description, owner, dataset_ids, process_id):
        """
            Customized create method to create model and model meta as a pair
        Args:
            dataset_ids:    A list [0, 1] indicating the validated dataset id
        """
        process = Process.objects.get(
            id=process_id) if process_id != -1 else None
        project_meta = ProjectMeta(
            name=name,
            date=date,
            location=location,
            description=description,
            # root_path=project_root_path,
            owner=owner)
        project_meta.save()

        project_root_path = f'media/projects/user_{owner.id}/project_{project_meta.id}'
        project_meta.root_path = project_root_path
        project_meta.save(update_fields=['root_path'])

        project = Project(
            project_meta=project_meta,
            process=process,
            owner=owner
        )
        project.save()
        # Add dataset instances
        project.datasets.add(*dataset_ids)
        return project_meta


class ProjectMeta(models.Model):

    name = models.CharField(max_length=50)
    date = models.DateField()
    location = models.CharField(max_length=50)
    description = models.TextField(max_length=200)
    status = models.IntegerField(default=0, editable=False)
    root_path = models.CharField(max_length=50, default="", editable=False)

    owner = models.ForeignKey(
        User, related_name="projectsmeta", on_delete=models.CASCADE, default=None)

    objects = ProjectMetaManager()

    class Meta:
        unique_together = ['name', 'owner']

    def __str__(self):
        return f'ProjectMeta {self.name} meta information'


class Project(models.Model):
    project_meta = models.OneToOneField(
        ProjectMeta, on_delete=models.CASCADE, default=None)
    owner = models.ForeignKey(
        User, related_name='projects', on_delete=models.CASCADE, null=True)
    process = models.ForeignKey(
        Process, related_name='projects', on_delete=models.SET_NULL, null=True)
    datasets = models.ManyToManyField(Dataset, through='Data', default=None)

    def __str__(self):
        return f'Project {self.project_meta.name} owned by {self.owner}'


class Data(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)

    STATUS = (
        ('R', 'running'),
        ('D', 'done'),
        ('F', 'failed')
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS,
        blank=True,
        editable=False
    )

    output_folder = models.CharField(max_length=200, editable=False)
    image_output_folder = models.CharField(max_length=200, editable=False)
    csv_output_folder = models.CharField(max_length=200, editable=False)

    image_output_zip_path = models.CharField(
        max_length=200, default="", editable=False)
    csv_output_zip_path = models.CharField(
        max_length=200, default="", editable=False)
