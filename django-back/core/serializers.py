from rest_framework import serializers
from rest_framework_jwt.settings import api_settings
from account.models import User
from datetime import datetime
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
    date_of_birth = serializers.DateField()

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def create(self, validated_data): #serializer.save() calls this func when serializer doesn't have self.instance
        password = validated_data.pop('password', None) #validated_data is python <DICT> .pop('key'[,default return]) is inner function of <DICT> which returns VALUE of given KEY. If there is no matched data, returns default return.
        date_of_birth = validated_data.pop('date_of_birth', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        if date_of_birth is not None:
            setattr(instance, 'date_of_birth', date_of_birth) #set value at specific attribute in the object
        else: 
            setattr(instance, 'date_of_birth', datetime.today().strftime('%Y-%m-%d')) #FIX IT: don't need..? 
        instance.save()
        return instance
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            if attr == 'updated_at':
                setattr(instance, 'updated_at', datetime.now().strftime("%Y-%m-%d %H:%M"))
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance

    class Meta:
        model = User
        fields = ('token', 'email', 'date_of_birth', 'password',)