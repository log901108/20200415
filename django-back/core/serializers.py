from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from rest_framework_jwt.settings import api_settings
from account.models import User
from datetime import datetime, timedelta
from time import time
"""
Serializer is used to change from django '<QUERYSET>' formated data to python '<DICTIONARY>' data
<QUREYSET>: interface which generates SQL in django. it support chaninning likes model.objects.all().filter().order_by()
<DICTIONARY>: python dict format which is represented by format of key:value i.e. {"key1":"value1", "key2":"value2", ...}

"""
class UserSerializer(serializers.ModelSerializer):

    val = serializers.SerializerMethodField() #read-only field
    
    def get_val(self, obj):
        value = {"a":"1", "b":"2"}
        return value
    
    class Meta:
        model = User
        fields = ('email', 'val')    

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
        fields = ('token', 'email', 'date_of_birth', 'password', 'refresh_token', )

        
class UserSerializerWithRefreshToken(serializers.ModelSerializer):
    """
    This serializer provide refresh_token in db when expired time is valid, or redistribute new refresh_token then save the new token to DB      
    """
    #
    refresh_token = serializers.SerializerMethodField()
    token = serializers.SerializerMethodField()
    #
    password = serializers.CharField(write_only=True)
    date_of_birth = serializers.DateField()

    def get_refresh_token(self, obj):
        """
          
        """
        user_instance = User.objects.get(pk=obj.id) #check obj by pk id
        
        if user_instance is not None:
            print('user_instance is not none:', user_instance)
                
            if user_instance.refresh_token is not None:
                print('refresh_token is not none:', user_instance.refresh_token)
                jwt_decode_handler = api_settings.JWT_DECODE_HANDLER
                payload = jwt_decode_handler(user_instance.refresh_token) #TODO: 잘못된 토큰값에 대한 반응 분기
                print("payload:",payload["exp"])
                refresh_exp = payload["exp"]
                print("now", time())
                if refresh_exp > time():
                    print('refresh_token is NOT expired')
                    return user_instance.refresh_token
                else:
                    print('refresh_token is expired')
                    jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
                    jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

                    payload = jwt_payload_handler(obj, True)
                    refresh_token = jwt_encode_handler(payload)
        
                    user_instance.refresh_token = refresh_token
                    user_instance.save()
                    return refresh_token
                    
            else: #null value of refresh_token
                print('user creation: refresh_token is none')
                jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
                jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

                payload = jwt_payload_handler(obj, True)
                refresh_token = jwt_encode_handler(payload)
        
                user_instance.refresh_token = refresh_token
                user_instance.save()
                return refresh_token
        else: #no user_instance
            return ObjectDoesNotExist()
    
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
        fields = ('token', 'email', 'date_of_birth', 'password', 'refresh_token', )
        