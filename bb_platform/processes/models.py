import os

from django.conf import settings
from django.db import models
from django.contrib.auth.models import User


def upload_pytorch_model(instance, filename):
    model_type_dict = settings.MODEL_TYPE_DICT
    return '/'.join(['pytorch_models', model_type_dict[instance.model_type], f'tmp_{instance.name}_tmp', filename])


class PyTorchModel(models.Model):
    name = models.CharField(max_length=50, unique=True)
    model_type = models.IntegerField()
    description = models.TextField(max_length=200)
    filepath = models.FileField(upload_to=upload_pytorch_model)

    def __str__(self):
        return f'PyTorch Model {self.name} meta information'


def upload_metric_func(instance, filename):
    metric_func_dict = settings.METRIC_FUNC
    return '/'.join(['metric_funcs', metric_func_dict[instance.metric_func], f'tmp_{instance.name}_tmp', filename])


class MetricFunc(models.Model):
    name = models.CharField(max_length=50, unique=True)
    metric_func = models.IntegerField()
    description = models.TextField(max_length=200)
    filepath = models.FileField(upload_to=upload_metric_func)

    def __str__(self):
        return f'Metric function {self.name} meta information'


class ProcessMetaManager(models.Manager):
    def create(self, name, description, owner, viz_tech, pytorch_model_id, metric_func_ids):
        """
            Customized create method to create model and model meta as a pair
        Args:
            pytorch_model_id:      An integer indicating the validated process model id
        """
        pytorch_model = PyTorchModel.objects.get(
            id=pytorch_model_id)

        process_meta = ProcessMeta(
            name=name,
            description=description,
            viz_tech=viz_tech,
            pytorch_model=pytorch_model,
            owner=owner)
        process_meta.save()
        process = Process(
            process_meta=process_meta,
            owner=owner
        )
        process.save()
        # Add metric func instances
        process_meta.metric_funcs.add(*metric_func_ids)
        return process_meta


class ProcessMeta(models.Model):

    name = models.CharField(max_length=50)
    description = models.TextField(max_length=200)
    viz_tech = models.CharField(max_length=100, default="")

    output_path = models.CharField(max_length=200, editable=False)
    image_output_path = models.CharField(max_length=200, editable=False)
    csv_output_path = models.CharField(max_length=200, editable=False)
    status = models.IntegerField(default=0, editable=False)

    pytorch_model = models.ForeignKey(
        PyTorchModel, related_name="procmeta", on_delete=models.CASCADE)
    owner = models.ForeignKey(
        User, related_name="processesmeta", on_delete=models.CASCADE, null=True)

    metric_funcs = models.ManyToManyField(MetricFunc)

    objects = ProcessMetaManager()

    class Meta:
        unique_together = ['name', 'owner']

    def __str__(self):
        return f'Process Meta {self.name} meta information'


class Process(models.Model):
    process_meta = models.OneToOneField(
        ProcessMeta, on_delete=models.CASCADE, default=None)
    owner = models.ForeignKey(
        User, related_name="processes", on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f'Process {self.process_meta.name} owned by {self.owner}'
