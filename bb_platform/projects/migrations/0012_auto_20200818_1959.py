# Generated by Django 3.1 on 2020-08-18 19:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0011_auto_20200818_1926'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectmeta',
            name='status',
            field=models.IntegerField(default=0, editable=False),
        ),
    ]