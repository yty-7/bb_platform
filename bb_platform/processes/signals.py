from django.db.models.signals import post_save
from django.dispatch import receiver

from processes.models import PyTorchModel, MetricFunc

from datasets.signals import update, check


@receiver(post_save, sender=PyTorchModel)
def update_pytorch_model_filepath(sender, created, instance, **kwargs):
    if created or check(instance):
        print('PyTorch model signal triggered')
        update(instance, prefix='model')


@receiver(post_save, sender=MetricFunc)
def update_metric_filepath(sender, created, instance, **kwargs):
    if created or check(instance):
        print('Metric func signal triggered')
        update(instance, prefix='metric')
