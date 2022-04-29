from processes.models import ProcessMeta, PyTorchModel, MetricFunc

from projects.models import ProjectMeta

from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator


class MetricFuncSerializer(serializers.ModelSerializer):
    metric_func = serializers.IntegerField(min_value=0, max_value=3)

    class Meta:
        model = MetricFunc
        fields = '__all__'


class PyTorchModelSerializer(serializers.ModelSerializer):
    model_type = serializers.IntegerField(min_value=0, max_value=5)

    class Meta:
        model = PyTorchModel
        fields = '__all__'


class ProcessMetaSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(
        read_only=True, default=serializers.CurrentUserDefault())
    pytorch_model_id = serializers.IntegerField(
        min_value=0, write_only=True)
    metric_func_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=0),
        write_only=True,
        required=False
    )

    def validate_pytorch_process_model_id(self, value):
        """
            Check the given id is validated
        """
        if not value:
            raise serializers.ValidationError('This field is required')

        if not PyTorchModel.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'PyTorch model {value} does not exist')

        return value

    class Meta:
        model = ProcessMeta
        fields = ['id', 'name', 'description', 'viz_tech', 'owner',
                  'pytorch_model_id', 'metric_func_ids', 'status']
        validators = [
            UniqueTogetherValidator(
                queryset=ProcessMeta.objects.all(),
                fields=['name', 'owner'],
                message='Process name should be unique'
            )
        ]

    def create(self, validated_data):
        return ProcessMeta.objects.create(
            name=validated_data['name'],
            description=validated_data['description'],
            owner=validated_data['owner'],
            viz_tech=validated_data['viz_tech'],
            pytorch_model_id=validated_data['pytorch_model_id'],
            metric_func_ids=validated_data['metric_func_ids']
        )
