from django.apps import AppConfig


class ProcessesConfig(AppConfig):
    name = 'processes'

    def ready(self):
        import processes.signals
