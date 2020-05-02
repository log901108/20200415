from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
# Create your views here.

from .models import Post
from .serializers import PostSerializer, hyperSerializer, HSerializer


class ListPost(generics.ListCreateAPIView):
    #permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Post.objects.all()
    serializer_class = PostSerializer


class DetailPost(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    

@api_view(['GET'])
def current_user(request):
    """
    Determine the current user by their token, and return their data
    """
    queryset = Post.objects.all()
    print(queryset)
    serializer = hyperSerializer(queryset,many=True,context={'request': request}) #Serializer(instance=value, data=value, **kwargs)
    return Response(serializer.data)