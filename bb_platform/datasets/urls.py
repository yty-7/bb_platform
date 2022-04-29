from django.conf.urls import url
from rest_framework import routers
from datasets.views import DatasetMetaCreateListView, DatasetMetaUpdateView, ProjectDatasetListView
from datasets.views import query_status

urlpatterns = [
    url(r'^api/datasets/$',
        DatasetMetaCreateListView.as_view(),
        name='dataset_metas'),
    url(r'^api/datasets/(?P<pk>[0-9]+)/$',
        DatasetMetaUpdateView.as_view(),
        name='dataset_meta'),
    url(r'^api/datasets/project-(?P<pk>[0-9]+)/list_datasets/',
        ProjectDatasetListView.as_view(),
        name='project_datasets'),

    url(r'^api/datasets/project-(?P<pk>[0-9]+)/query_status/',
        query_status,
        name='query_status')
]
