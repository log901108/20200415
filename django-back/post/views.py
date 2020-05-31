from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
# Create your views here.

from .models import Post
from .serializers import PostSerializer, hyperSerializer, HSerializer

import pika


class ListPost(generics.ListCreateAPIView):
    #permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Post.objects.all().order_by('-pk')
    serializer_class = PostSerializer


class DetailPost(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    

@api_view(['GET'])
def current_user(request):
    """
    Determine the current user by their token, and return their data
    """
    queryset = Post.objects.all().order_by('pk')
    print(queryset)
    ##
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()


    channel.queue_declare(queue='hello')

    channel.basic_publish(exchange='',
                      routing_key='hello',
                      body=queryset)
    print(" [x] Sent 'Hello World!'")
    connection.close()
    ##
    serializer = hyperSerializer(queryset,many=True,context={'request': request}) #Serializer(instance=value, data=value, **kwargs)
    return Response(serializer.data)