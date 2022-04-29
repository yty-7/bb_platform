from datasets.models import DatasetMeta

from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator


class DatasetMetaSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(
        read_only=True, default=serializers.CurrentUserDefault())

    class Meta:
        model = DatasetMeta
        fields = '__all__'
        validators = [
            UniqueTogetherValidator(
                queryset=DatasetMeta.objects.all(),
                fields=['name', 'owner'],
                message='Dataset name should be unique'
            )
        ]

    def create(self, validated_data):
        return DatasetMeta.objects.create(
            name=validated_data['name'],
            description=validated_data['description'],
            filepath=validated_data['filepath'],
            platform=validated_data['platform'],
            mode=validated_data['mode'],
            structure=validated_data['structure'],
            annotation=validated_data['annotation'],
            owner=validated_data['owner']
        )

# name, description, filepath, platform, mode, structure, annotation, owner
