# Generated by Django 3.1 on 2020-10-27 17:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('processes', '0008_auto_20201027_0420'),
    ]

    operations = [
        migrations.RenameField(
            model_name='processmeta',
            old_name='pytorch_process_model',
            new_name='pytorch_model',
        ),
    ]
