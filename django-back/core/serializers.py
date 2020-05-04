import jwt
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
    리프레시토큰이 있어야 하는 이유:
                                1. 토큰 방식은 최근 및 향후 트랜드인 다중디바이스 환경에서 다중 로그인을 가능케 해준다.
                                2. 그러나 stateless한 토큰 방식으로는 토큰이 기간만료되지 않는 이상 이상행위를 하는 유저에 대해서 강제 인증 만료등의 운영행위가 불가능하다.
                                   그렇다고 authenticate를 계속하면 UX 만족도가 떨어짐
                                3. 리프레시토큰은 db에 저장되므로 비교를 통해 이를 가능케 한다. access 토큰은 짧게 만료시간을 주고 middleware에서 api중에서 필요한 경우 토큰을 디코드하여 리프레시토큰을 확인하여 
                                   유효한지 확인하고 기간이 만료되지 않은경우 access토큰을 자동으로 갱신하게 한다.  
    """
    #
    refresh_token = serializers.SerializerMethodField()
    token = serializers.SerializerMethodField()
    #
    password = serializers.CharField(write_only=True)
    date_of_birth = serializers.DateField()

    def get_refresh_token(self, obj):
        """
        리프레시 토큰 발행 함수 
        """
        
        if obj is not None:
            print('user instance is not none:', obj)
                
            if obj.refresh_token is not None:
                print('refresh_token is not none:', obj.refresh_token)
                jwt_decode_handler = api_settings.JWT_DECODE_HANDLER
                # 잘못된 토큰값에 대한 반응 분기
                try:
                    payload = jwt_decode_handler(obj.refresh_token)
                except jwt.ExpiredSignature:
                    msg = _('Signature has expired.')
                    raise serializers.ValidationError(msg)
                except jwt.DecodeError:
                    msg = _('Error decoding signature.')
                    raise serializers.ValidationError(msg)
                print("payload:",payload["exp"])
                refresh_exp = payload["exp"]
                print("now", time())
                if refresh_exp > time():
                    print('refresh_token is NOT expired')
                    return obj.refresh_token
                else:
                    print('refresh_token is expired')
                    jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
                    jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

                    payload = jwt_payload_handler(obj, True)
                    refresh_token = jwt_encode_handler(payload)
        
                    obj.refresh_token = refresh_token
                    obj.save()
                    return refresh_token
                    
            else: #null value of refresh_token
                print('user creation: refresh_token is none')
                jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
                jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

                payload = jwt_payload_handler(obj, True)
                refresh_token = jwt_encode_handler(payload)
        
                obj.refresh_token = refresh_token
                obj.save() #이부분에서 obj(user model instance)가 업데이트되어 access token 발행시 refresh_token을 포함하여 발행
                return refresh_token
        else: #no user_instance
            msg = _('no user instance')
            raise serializers.ValidationError(msg)
    
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
            try:       
                setattr(instance, 'date_of_birth', date_of_birth) #set value at specific attribute in the object
                instance.save()
                return instance   
            except: 
                msg = _('set attr error')
                raise serializers.ValidationError(msg)
        else: 
            msg = _('required field no value')
            raise serializers.ValidationError(msg)
        
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            if attr == 'updated_at':
                setattr(instance, 'updated_at', datetime.now().strftime("%Y-%m-%d %H:%M"))        
                instance.save()
                return instance
            else:
                setattr(instance, attr, value)


    class Meta:
        model = User
        fields = ('email', 'date_of_birth', 'password', 'refresh_token', 'token',) #순서 중요. token이 나중에 불러져야 refresh_token이 생성되서 token payload에 포함됨
        """
        Django 아키텍쳐상 (MTV) MVC와 달리
        Model View Template
        Model DB 구조 결정
        View Controller db와 view의 html을 연결
        Template View html구조
        의 구조를 가지므로 Serializer에서 DB와 연결된 작업을 하는 것이 맞는지 모르겠다. 근데 보니깐 serializer 공식페이지에서 그렇게 사용하네...
        """
        