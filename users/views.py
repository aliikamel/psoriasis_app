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
    Create a user with a specific role and associated profile using the UserCreateSerializer.
    """
    serializer = UserCreateSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomUserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing patient profiles.
    """
    serializer_class = CustomUserSerializer
    queryset = CustomUser.objects.all()


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
