# Generated by Django 3.1.1 on 2020-09-10 16:18

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('datasets', '0002_auto_20200828_1957'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='datasetmeta',
            unique_together={('name', 'owner')},
        ),
    ]
