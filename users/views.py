from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CustomUser, PatientProfile, DermatologistProfile, DermatologistPatientRelationship
from .serializers import (CustomUserSerializer, PatientProfileSerializer,
                          DermatologistProfileSerializer, UserCreateSerializer,
                          DermatologistPatientRelationshipSerializer)
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ObjectDoesNotExist


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


@api_view(['POST'])
def create_patient_dermatologist_relationship(request):
    serializer = DermatologistPatientRelationshipSerializer(data=request.data)

    if serializer.is_valid():
        relationship = serializer.save()

        response_data = {
            'id': relationship.id,
            'dermatologist': relationship.dermatologist.id,
            'patient': relationship.patient.id,
        }

        return Response(response_data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_patients_managed(request):
    # Get the dermatologist_id from query parameters
    dermatologist_id = request.query_params.get('dermatologist_id')

    # Filter the queryset based on the dermatologist_id, if provided
    if dermatologist_id is not None:
        relationships = DermatologistPatientRelationship.objects.filter(dermatologist_id=dermatologist_id)
        patient_ids = relationships.values_list('patient_id', flat=True)

        # Fetching patient profiles based on those IDs
        patients = CustomUser.objects.filter(id__in=patient_ids)
        serializer = CustomUserSerializer(patients, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Dermatologist ID is required."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_patient_details_by_id(request):
    # Get the dermatologist_id from query parameters
    patient_id = request.query_params.get('patient_id')

    if patient_id is not None:
        # Assuming `user` is a ForeignKey in PatientProfile pointing to the user model
        patient_profile = PatientProfile.objects.get(user_id=patient_id)
        serializer = PatientProfileSerializer(patient_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Patient ID is required."}, status=status.HTTP_400_BAD_REQUEST)


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
