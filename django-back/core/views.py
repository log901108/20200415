import jwt
from django.http import HttpResponseRedirect
from account.models import User
from rest_framework import permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.reverse import reverse
from rest_framework_jwt.settings import api_settings
from .serializers import UserSerializer, UserSerializerWithToken, UserSerializerWithRefreshToken
from rest_framework.authentication import (
    BaseAuthentication, get_authorization_header
)
from django.utils.encoding import smart_text
from django.utils.translation import ugettext as _
from rest_framework import exceptions

import pika

@api_view(['GET'])
def current_user(request):
    www_authenticate_realm = 'api'
    print('req:',request.user.is_anonymous)
    print(request.path)
    ##
    credentials = pika.PlainCredentials('testuser', 'test')
    parameters = pika.ConnectionParameters('localhost',
                                       5672,
                                       'vh1',
                                       credentials)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()


    channel.queue_declare(queue='hello')

    channel.basic_publish(exchange='',
                      routing_key='hello',
                      body=str(request.path))
    print(" [x] Sent 'Hello World!'")
    connection.close()
    ##

    def get_jwt_value(request): #function for parsing Authorization header
        auth = get_authorization_header(request).split()
        auth_header_prefix = api_settings.JWT_AUTH_HEADER_PREFIX.lower()

        if not auth:
            if api_settings.JWT_AUTH_COOKIE:
                return request.COOKIES.get(api_settings.JWT_AUTH_COOKIE)
            return None

        if smart_text(auth[0].lower()) != auth_header_prefix:
            return None

        if len(auth) == 1:
            msg = _('Invalid Authorization header. No credentials provided.')
            raise exceptions.AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = _('Invalid Authorization header. Credentials string '
                    'should not contain spaces.')
            raise exceptions.AuthenticationFailed(msg)
        return auth[1]

    def authenticate_header(self, request):
        return '{0} realm="{1}"'.format(api_settings.JWT_AUTH_HEADER_PREFIX, self.www_authenticate_realm)
    
    #1. request로 들어온 정보를 middleware에서 유저에 해당하는 model instance를 가져온다
    
    #2. request Authorization 헤더로부터 access토큰을 가져와서 decode하고 refresh토큰을 파싱한다. 없으면 에러 발생
    jwt_decode_handler = api_settings.JWT_DECODE_HANDLER
    access_token = get_jwt_value(request)
    
    if 'refresh_token' in jwt_decode_handler(access_token):
        intoken_refresh_token = jwt_decode_handler(access_token)["refresh_token"]
    else:
        msg = _('INVALID refreh token. DEBUG:token does not have refresh_token')
        raise exceptions.AuthenticationFailed(msg)
        return Response({"errors":msg})
    
    #3. 테이블에 있는 refresh_token과 access토큰 내의 refresh_token 값을 비교해서 같으면 인증절차. 아니면 에러
    if request.user.refresh_token == intoken_refresh_token:
        jwt_decode_handler = api_settings.JWT_DECODE_HANDLER
        try:
            payload = jwt_decode_handler(request.user.refresh_token)
            serializer = UserSerializerWithRefreshToken(request.user) #Serializer(instance=value, data=value, **kwargs)
            return Response(serializer.data,status=status.HTTP_200_OK)
        except jwt.ExpiredSignature:
            msg = _('Signature has expired.')
            raise serializers.ValidationError(msg)
        except jwt.DecodeError:
            msg = _('Error decoding signature.')
            raise serializers.ValidationError(msg)
    else:
        msg = _('INVALID refreh token. DEBUG: refresh token does not match with DB')
        raise exceptions.AuthenticationFailed(msg)
        return Response({"errors":msg})


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