from rest_framework import serializers
from rest_framework_jwt.settings import api_settings
from account.models import User

"""
Serializer is used to change from django '<QUERYSET>' formated data to python '<DICTIONARY>' data
<QUREYSET>: interface which generates SQL in django. it support chaninning likes model.objects.all().filter().order_by()
<DICTIONARY>: python dict format which is represented by format of key:value i.e. {"key1":"value1", "key2":"value2", ...}

"""
class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('email',)


class UserSerializerWithToken(serializers.ModelSerializer):

    token = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True)

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def create(self, validated_data): #if called serializer doesn't have self.instance
        password = validated_data.pop('password', None) #validated_data is python <DICT> .pop('key'[,default return]) is inner function of <DICT> which returns VALUE of given KEY. If there is no matched data, returns default return. 
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    class Meta:
        model = User
        fields = ('token', 'email', 'password')