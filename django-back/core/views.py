from django.http import HttpResponseRedirect
from account.models import User
from rest_framework import permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.reverse import reverse
from .serializers import UserSerializer, UserSerializerWithToken, UserSerializerWithRefreshToken



@api_view(['GET'])
def current_user(request):
    """
    Determine the current user by their token, and return their data
    """
    
    serializer = UserSerializer(request.user) #Serializer(instance=value, data=value, **kwargs)
    return Response(serializer.data)


class UserList(APIView):
    """
    Create a new user. It's called 'UserList' because normally we'd have a get
    method here too, for retrieving a list of all User objects.
    """

    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = UserSerializerWithRefreshToken(data=request.data) #serializer changes from django <QUERYSET> to python <DICT> format
        if serializer.is_valid():
            serializer.save() #if it has self.instance, use update(). if it doesn't have self.instance, use create()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)