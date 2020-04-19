from rest_framework import serializers
from .models import ApiServer


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'title',
            'content',            
        )
        model = ApiServer