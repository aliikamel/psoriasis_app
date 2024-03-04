from django.urls import path, include
from . import views
from rest_framework import routers

urlpatterns = [
    path('hello-world/', views.hello_world, name='hello_world'),
    path('run-model/', views.run_model, name='run_model')
]

