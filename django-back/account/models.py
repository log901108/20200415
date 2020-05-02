"""
#Reference URL: https://dev-yakuza.github.io/ko/django/custom-user-model/
"""
from django.db import models
from django.contrib.auth.models import (BaseUserManager, AbstractBaseUser) #BaseUserManager is helper class to create user, AbstractBaseUser is exact model which is inheritatible 
from datetime import datetime

class UserManager(BaseUserManager):
    def create_user(self, email, date_of_birth, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            date_of_birth=date_of_birth,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, date_of_birth, password):
        user = self.create_user(
            email,
            password=password,
            date_of_birth=date_of_birth,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    email = models.EmailField(
        verbose_name='email',
        max_length=255,
        unique=True,
    )
    date_of_birth = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True) #TODO: Created_at setting, you should understand difference between auto_now: insert time every change and auto_now_add:insert time when created option.https://docs.djangoproject.com/en/3.0/ref/models/fields/#datetimefield
    updated_at = models.DateTimeField(auto_now=True) #TODO: Updated_at setting
    deleted_at = models.DateTimeField(null=True, blank=True) #TODO: set deleted_at when call deleted. the property "is_active" do same function in deleted_at gives also JWT operates by the property. however we still need to get deleted time.
    refresh_token = models.TextField(null=True, blank=True) #TODO: check null and blank attribute usage
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['date_of_birth']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin