from core.serializers import UserSerializer
import jwt
import uuid

from django.contrib.auth import get_user_model
from calendar import timegm
from datetime import datetime

from rest_framework_jwt.compat import get_username
from rest_framework_jwt.compat import get_username_field
from rest_framework_jwt.settings import api_settings

#custom jwt response from /token-auth/ url setting
def my_jwt_response_handler(token, user=None, request=None):
    return {
        'token': token,
        'user': UserSerializer(user, context={'request': request}).data
    }

#custom jwt token payload by jwt apis setting
#ARGS: auth.user
#RETURN : payload 
def my_jwt_payload_handler(user):
    username_field = get_username_field()
    username = get_username(user)

    payload = {
        'user_id': user.pk,
        'username': user.email,
        'password': user.password,
        'exp': datetime.utcnow() + api_settings.JWT_EXPIRATION_DELTA
    }
    #if hasattr(user, 'username'):
    #    payload['username'] = user.username
    if isinstance(user.pk, uuid.UUID):
        payload['user_id'] = str(user.pk)

    payload[username_field] = user.email

    # Include original issued at time for a brand new token,
    # to allow token refresh
    if api_settings.JWT_ALLOW_REFRESH:
        payload['orig_iat'] = timegm(
            datetime.utcnow().utctimetuple()
        )

    if api_settings.JWT_AUDIENCE is not None:
        payload['aud'] = api_settings.JWT_AUDIENCE

    if api_settings.JWT_ISSUER is not None:
        payload['iss'] = api_settings.JWT_ISSUER

    return payload
    