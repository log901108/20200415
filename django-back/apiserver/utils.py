from core.serializers import UserSerializer, UserSerializerWithRefreshToken
import jwt
import uuid

from django.contrib.auth import get_user_model
from calendar import timegm
from datetime import datetime, timedelta

from rest_framework_jwt.compat import get_username
from rest_framework_jwt.compat import get_username_field
from rest_framework_jwt.settings import api_settings

#custom jwt response from /token-auth/ url setting
def my_jwt_response_handler(token, user=None, request=None):
    userdata = UserSerializerWithRefreshToken(user, context={'request': request}).data # refresh_token 발급과정까지 포함
    return {
        'token': token,
        'user': {"email":userdata["email"]} ##
    }

#custom jwt token payload by jwt apis setting
#ARGS: auth.user, is_refresh_token(BOOL default=False)
#RETURN : payload 
def my_jwt_payload_handler(user, is_refresh_token = False):
    username_field = get_username_field()
    username = get_username(user)
    
    if is_refresh_token is False :   
        payload = {
            'user_id': user.pk,
            'username': user.email,
            'refresh_token': user.refresh_token,
            'exp': datetime.utcnow() + api_settings.JWT_EXPIRATION_DELTA
        }
    else: #payload for refresh_token
        payload = {
            'user_id': user.pk,
            'username': user.email,
            'password': user.password,
            'exp': datetime.utcnow() + timedelta(days=7)
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
    