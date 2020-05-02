from django.urls import path

from . import views
from .views import current_user

urlpatterns = [
    path('', views.ListPost.as_view()),
    path('<int:pk>/', views.DetailPost.as_view()),
    path('hy/', current_user)
]