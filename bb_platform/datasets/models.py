from django.db import models
from django.contrib.auth.models import User


def upload_filepath(instance, filename):
    """
        Save the uploaded file into the tmp direcotry, which will be updated after saving
        by post_save signal
    """
    user_id = f'user_{instance.owner.id}'
    return '/'.join(['datasets', user_id, f'tmp_{instance.name}_tmp', filename])


class DatasetMetaManager(models.Manager):
    def create(self, name, description, filepath, platform, mode, structure, annotation, owner):
        dataset_meta = DatasetMeta(
            name=name,
            description=description,
            filepath=filepath,
            platform=platform,
            mode=mode,
            structure=structure,
            annotation=annotation,
            owner=owner)
        dataset_meta.save()
        dataset = Dataset(
            dataset_meta=dataset_meta,
            owner=owner
        )
        dataset.save()
        return dataset_meta


class DatasetMeta(models.Model):

    name = models.CharField(max_length=50)
    description = models.TextField(max_length=200)
    filepath = models.FileField(upload_to=upload_filepath)
    # BLACKBIRD = 0 PMROBOT = 1
    platform = models.IntegerField()
    # TRAINING = 0 VALIDATION = 1 INFERENCE = 2
    mode = models.IntegerField()
    # DEFAULT = 0 VARIANT1 = 1
    structure = models.IntegerField()
    # LABELBOX = 0 VIA = 1 MATLAB = 2
    annotation = models.IntegerField()
    status = models.IntegerField(default=0, editable=False)

    owner = models.ForeignKey(
        User, related_name="datasetsmeta", on_delete=models.CASCADE)

    objects = DatasetMetaManager()

    class Meta:
        unique_together = ['name', 'owner']

    def __str__(self):
        return f'DatasetMeta {self.name} meta information'


class Dataset(models.Model):
    dataset_meta = models.OneToOneField(
        DatasetMeta, on_delete=models.CASCADE, default=None)
    owner = models.ForeignKey(
        User, related_name="datasets", on_delete=models.CASCADE, null=True)

    def __str__(self):
        return f'Dataset {self.dataset_meta.name} owned by {self.owner}'
