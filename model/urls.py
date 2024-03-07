from django.urls import path, include
from . import views

urlpatterns = [
    path('run-model/', views.run_model, name='run_model'),
    path('test-model/', views.test_model, name='test_model')
]

