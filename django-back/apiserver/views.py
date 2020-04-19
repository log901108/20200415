from django.shortcuts import render
from rest_framework import generics

from .models import ApiServer
from .serializers import PostSerializer

# Create your views here.
class ListPost(generics.ListCreateAPIView):
    queryset = ApiServer.objects.all()
    serializer_class = PostSerializer
    
class DetailPost(generics.RetrieveUpdateDestroyAPIView):
    queryset = ApiServer.objects.all()
    serializer_class = PostSerializer