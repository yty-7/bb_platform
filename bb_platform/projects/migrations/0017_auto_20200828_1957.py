# Generated by Django 3.1 on 2020-08-28 19:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0016_project_process'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectmeta',
            name='name',
            field=models.CharField(max_length=50),
        ),
    ]
