from projects.models import ProjectMeta, Data

from datasets.models import DatasetMeta, Dataset
from processes.models import ProcessMeta, Process

from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator


class DataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Data
        fields = '__all__'
        read_only_fields = ['status', 'output_path',
                            'image_output_path', 'csv_output_path']


class ProjectMetaSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(
        read_only=True, default=serializers.CurrentUserDefault())
    date = serializers.DateField(
        input_formats=['iso-8601', '%Y-%m-%dT%H:%M:%S.%fZ'])
    dataset_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=0),
        write_only=True
    )
    process_id = serializers.IntegerField(write_only=True, required=False)

    def validate_process_id(self, value):
        """
            Check that the given process meta id is validated and convert it to process id
        """
        if not ProcessMeta.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'PyTorch model {value} does not exist')

        valid_id = Process.objects.filter(
            process_meta_id=value).values_list('id', flat=True)

        return valid_id[0]

    def validate_dataset_ids(self, value):
        """
            Check that the given dataset meta ids are validated and convert them to datase ids
        Args:
            value:       A list ([0, 1]) indicating the dataset meta id (not dataset id)
        Return:
            valid_ids:   A list containing validated dataset ids
        """
        # Check Empty
        if not value:
            return []
        # Meta ids
        valid_ids = DatasetMeta.objects.filter(
            id__in=value).values_list('id', flat=True)
        invalid_ids = list(set(value) - set(valid_ids))

        if invalid_ids:
            raise serializers.ValidationError(
                f'{invalid_ids} dataset does not exist')

        # Dataset ids
        dataset_valid_ids = Dataset.objects.filter(
            dataset_meta_id__in=valid_ids).values_list('id', flat=True)
        return dataset_valid_ids

    class Meta:
        model = ProjectMeta
        fields = '__all__'
        validators = [
            UniqueTogetherValidator(
                queryset=ProjectMeta.objects.all(),
                fields=['name', 'owner'],
                message='Project name should be unique'
            )
        ]

    def create(self, validated_data):
        process_id = validated_data.pop('process_id', -1)
        return ProjectMeta.objects.create(
            name=validated_data['name'],
            date=validated_data['date'],
            location=validated_data['location'],
            description=validated_data['description'],
            owner=validated_data['owner'],
            dataset_ids=validated_data['dataset_ids'],
            process_id=process_id
        )
