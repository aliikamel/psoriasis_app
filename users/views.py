from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CustomUser, PatientProfile, DermatologistProfile
from .serializers import (CustomUserSerializer, PatientProfileSerializer,
                          DermatologistProfileSerializer, UserCreateSerializer)
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(['POST'])
def create_user(request):
    """
    Create a user with a specific role and associated profile using the UserCreateSerializer.
    """
    serializer = UserCreateSerializer(data=request.data)

    # print(serializer)
    if serializer.is_valid():
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }

        response_data = {**serializer.data, **tokens}

        print(response_data)
        return Response(response_data, status=status.HTTP_201_CREATED)
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

