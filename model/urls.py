from django.urls import path, include
from . import views

urlpatterns = [
    path('hello-world/', views.hello_world, name='hello_world'),
    path('run-model/', views.run_model, name='run_model'),
    path('test-model/', views.test_model, name='test_model')
]

