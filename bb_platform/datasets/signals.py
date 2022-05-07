import os
import re

from django.db.models.signals import post_save
from django.dispatch import receiver

from datasets.models import DatasetMeta


def check(instance):
    p = re.compile(r'tmp_.*_tmp')
    old_filepath = instance.filepath.path

    return p.search(old_filepath)


def update(instance, prefix):
    p = re.compile(r'tmp_.*_tmp')
    print(f'instance.filepath: {instance.filepath}')
    #print("update is>>>>>>>>>"+instance.filepath)

    old_filepath = instance.filepath.path
    #print("filepath is>>>>>>>>>"+old_filepath)

    try:
        old_id = p.search(old_filepath).group()
        new_id = f'{prefix}_{instance.id}'
        #print("old id is>>>>>>>>>"+old_id)
        #print("new id is>>>>>>>>>"+new_id)

        new_filepath = p.sub(new_id, old_filepath)
        instance.filepath = new_filepath
        #print("filepath is>>>>>>>>>"+instance.filepath)
        instance.save(update_fields=['filepath'])

        folder_path = old_filepath[:old_filepath.index(old_id)]
        os.rename(os.path.join(folder_path, old_id),
                  os.path.join(folder_path, new_id))

    except Exception as e:
        print("exception>>>>>>>>>"+new_id)
        print(e)


@receiver(post_save, sender=DatasetMeta)
def update_dataset_filepath(sender, created, instance, **kwargs):
    if created or check(instance):
        print('Dataset meta signal triggered')
        #update(instance, prefix='dataset')
