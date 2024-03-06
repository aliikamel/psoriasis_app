from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'patients', views.PatientProfileViewSet)
router.register(r'dermatologists', views.DermatologistProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('create_user/', views.create_user, name='create_user'),
]