# Generated by Django 3.1 on 2020-08-20 02:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('datasets', '0001_initial'),
        ('projects', '0012_auto_20200818_1959'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='datasets',
            field=models.ManyToManyField(default=None, to='datasets.Dataset'),
        ),
    ]