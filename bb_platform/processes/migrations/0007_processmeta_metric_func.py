# Generated by Django 3.1 on 2020-10-27 01:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('processes', '0006_metricfunc'),
    ]

    operations = [
        migrations.AddField(
            model_name='processmeta',
            name='metric_func',
            field=models.ManyToManyField(to='processes.MetricFunc'),
        ),
    ]