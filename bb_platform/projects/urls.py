from django.conf.urls import url
from rest_framework import routers
from projects.views import ProjectMetaCreateListView, ProjectMetaUpdateView, DataListView


urlpatterns = [
    url(r'^api/projects/$',
        ProjectMetaCreateListView.as_view(),
        name='project_metas'),
    url(r'^api/projects/(?P<pk>[0-9]+)/$',
        ProjectMetaUpdateView.as_view(),
        name='project_meta'),
    url(r'^api/project-(?P<pk>[0-9]+)/project_dataset_inter/$',
        DataListView.as_view(),
        name='project_dataset_inter'),
]
