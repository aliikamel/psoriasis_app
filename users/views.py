from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CustomUser, PatientProfile, DermatologistProfile
from .serializers import (CustomUserSerializer, PatientProfileSerializer,
                          DermatologistProfileSerializer, UserCreateSerializer)


@api_view(['POST'])
def create_user(request):
    """
    Create a user with a specific role.
    """
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        if request.data['role'] == 'patient':
            PatientProfile.objects.create(user=user)
        elif request.data['role'] == 'dermatologist':
            DermatologistProfile.objects.create(user=user)
        # Handle other roles as necessary
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientProfileViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing patient profiles.
    """
    serializer_class = PatientProfileSerializer
    queryset = PatientProfile.objects.all()


class DermatologistProfileViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing dermatologist profiles.
    """
    serializer_class = DermatologistProfileSerializer
    queryset = DermatologistProfile.objects.all()

# Add more viewsets as necessary for your models

# In your urls.py, register the viewsets with a router for automatic URL routing
# and the create_user view with a specific URL pattern.
