from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'patients', views.PatientProfileViewSet)
router.register(r'dermatologists', views.DermatologistProfileViewSet)
router.register(r'users', views.CustomUserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('create-user/', views.create_user, name='create_user'),
    path('add-patient/', views.create_patient_dermatologist_relationship, name='create_patient_dermatologist_relationship'),
    path('get-patients-managed/', views.get_patients_managed, name='get_patients_managed'),
    path('get-patient-details/', views.get_patient_details_by_id, name='get_patients_details_by_id')
]
