from django.conf.urls import url
from rest_framework import routers

from processes.views import ProcessMetaCreateListView, ProcessMetaUpdateView
from processes.views import ProjectProcessListView, ProcessModelListView, ProcessMetricListView
from processes.views import PyTorchModelCreateListView, PyTorchModelUpdateView
from processes.views import MetricFuncCreateListView, MetricFuncUpdateView

from processes.extra_views import run_process, display_image


urlpatterns = [
    url(r'^api/processes/$',
        ProcessMetaCreateListView.as_view(),
        name='process_metas'),
    url(r'^api/processes/(?P<pk>[0-9]+)/$',
        ProcessMetaUpdateView.as_view(),
        name='process_meta'),

    url(r'^api/pytorch_models/$',
        PyTorchModelCreateListView.as_view(),
        name='pytorch_models'),
    url(r'^api/pytorch_models/(?P<pk>[0-9]+)/$',
        PyTorchModelUpdateView.as_view(),
        name='pytorch_model'),

    url(r'^api/metrics/$',
        MetricFuncCreateListView.as_view(),
        name='metrics'),
    url(r'^api/metrics/(?P<pk>[0-9]+)/$',
        MetricFuncUpdateView.as_view(),
        name='metric'),

    url(r'^api/processes/project-(?P<pk>[0-9]+)/list_process/',
        ProjectProcessListView.as_view(),
        name='project_process'),
    url(r'^api/pytorch_models/process-(?P<pk>[0-9]+)/list_model/',
        ProcessModelListView.as_view(),
        name='process_model'),
    url(r'^api/metrics/process-(?P<pk>[0-9]+)/list_metrics/',
        ProcessMetricListView.as_view(),
        name='process_metrics'),

    url(r'^api/processes/run_process/',
        run_process,
        name='run_process'),
    url(r'^api/processes/display_image/',
        display_image,
        name='display_image'),
]
