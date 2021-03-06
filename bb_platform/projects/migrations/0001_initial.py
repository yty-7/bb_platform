# Generated by Django 3.1 on 2020-08-12 18:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectMeta',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True)),
                ('time', models.DateField()),
                ('location', models.CharField(max_length=50)),
                ('description', models.TextField(max_length=200)),
                ('status', models.IntegerField(choices=[(0, 'Active'), (1, 'Inactive'), (2, 'Delete')], default=0, editable=False)),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('owner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='projects', to=settings.AUTH_USER_MODEL)),
                ('project_meta', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='projects.projectmeta')),
            ],
        ),
    ]
