from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'title',
            'content',
        )
        model = Post

class hyperSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Post
        fields = ['url','id','title','content']
        extra_kwargs = {
            'url': {'view_name': 'post-detail', 'lookup_field': 'id'},
            'users': {'lookup_field': ''}
        }
        
class HSerializer(serializers.HyperlinkedModelSerializer):
    snippets = serializers.HyperlinkedRelatedField(many=True, view_name='post-detail', read_only=True)

    class Meta:
        model = Post
        fields = ('url', 'id', 'title','content','snippets')