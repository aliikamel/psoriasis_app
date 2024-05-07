from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CustomUser, PatientProfile, DermatologistProfile, DermatologistPatientRelationship, PatientTreatment
from .serializers import (CustomUserSerializer, PatientProfileSerializer,
                          DermatologistProfileSerializer, UserCreateSerializer,
                          DermatologistPatientRelationshipSerializer, PatientTreatmentSerializer)
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.utils import timezone
import datetime


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


@api_view(['POST'])
def create_patient_treatment(request):
    body = request.data

    # Extract the patient_profile_id from the request body
    patient_profile_id = body['patient_profile_id']

    # ensuring patient_profile exists first:
    try:
        patient_profile = PatientProfile.objects.get(id=patient_profile_id)
    except PatientProfile.DoesNotExist:
        return Response({"error": "Patient profile does not exist."}, status=status.HTTP_404_NOT_FOUND)

    # Extract the remaining data from the request body
    pasi_pre_treatment_date = datetime.datetime.strptime(body['pasi_pre_treatment_date'], "%d/%m/%Y").date()
    treatment_start_date = datetime.datetime.strptime(body['start_date'], "%d/%m/%Y").date()
    num_of_weeks = int(body['num_of_weeks'])
    weekly_sessions = int(body['weekly_sessions'])
    minimal_erythema_dose = float(body['med'])
    pasi_pre_treatment = float(body['pasi_pre_treatment'])

    # Preparing data for creating a treatment instance
    today = timezone.now().date()
    treatment_status = 'active' if treatment_start_date <= today else 'not_started'

    treatment_end_date = treatment_start_date + datetime.timedelta(weeks=num_of_weeks)

    # Constructing treatment_plan object
    treatment_plan = {
        "PASI_PRE_TREATMENT_DATE": pasi_pre_treatment_date.strftime("%d/%m/%Y"),
        "WEEKLY_SESSIONS": weekly_sessions,
        "PASI_PRE_TREATMENT": pasi_pre_treatment,
        "TREATMENT_START_DATE": treatment_start_date.strftime("%d/%m/%Y"),
        "TREATMENT_END_DATE": treatment_end_date.strftime("%d/%m/%Y"),
        "WEEKS": []
    }

    uv_protocol = [0.7, 0.7, 0.98, 0.98, 1.323, 1.323, 1.72, 1.72, 2.15, 2.15,
                   2.58, 2.58, 2.967, 2.967, 3.264, 3.264, 3.427, 3.427, 3.427, 3.427,
                   3.427, 3.427, 3.427, 3.427, 3.427, 3.427, 3.427, 3.427, 3.427, 3.427]

    sessions = 1
    current_date = treatment_start_date
    for week in range(1, num_of_weeks + 1):
        week_dict = {}

        for session_num in range(1, weekly_sessions + 1):
            session_key = f"session_{sessions}"

            # Set planned dose based on the above uv_protocol
            if sessions <= len(uv_protocol):
                planned_dose = round(minimal_erythema_dose * uv_protocol[sessions - 1], 2)
            else:
                planned_dose = round(minimal_erythema_dose * 3.427, 2)

            actual_dose = ""
            session_date = current_date.strftime("%d/%m/%Y")

            week_dict[session_key] = {
                "planned_dose": planned_dose,
                "actual_dose": actual_dose,
                "date": session_date
            }

            # Increment the current date by the interval between sessions within a week
            # will increment 2 days for 3 weekly sessions and increment 3 days for 2 weekly sessions
            sessions += 1
            current_date += datetime.timedelta(days=(7 - 1) / 3)

        # set current date to start at 1st day of the next week
        current_date = treatment_start_date + datetime.timedelta(weeks=week)

        # End of week processing
        week_dict["end_week_pasi"] = ""
        week_dict["status"] = ""
        week_dict["uv_eff"] = ""
        treatment_plan["WEEKS"].append(week_dict)

    treatment_data = {
        'patient_profile': patient_profile_id,
        'start_date': treatment_start_date,
        'end_date': treatment_end_date,
        'status': treatment_status,
        'treatment_plan': treatment_plan,
    }

    serializer = PatientTreatmentSerializer(data=treatment_data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def update_patient_treatment(request):
    treatment = request.data['treatment']
    try:
        # Assuming 'id' is sent in the request to identify the PatientTreatment instance
        treatment_id = treatment['id']

        # Fetch the treatment instance to be updated
        treatment_instance = get_object_or_404(PatientTreatment, id=treatment_id)

        # Extract the new treatment_plan from the request
        new_treatment_plan = treatment['treatment_plan']

        if new_treatment_plan is not None:
            # Update only the treatment_plan field
            treatment_instance.treatment_plan = new_treatment_plan
            treatment_instance.save()

            return Response({'message': 'Treatment plan updated successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'No treatment plan provided.'}, status=status.HTTP_400_BAD_REQUEST)

    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


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


# @api_view(['GET'])
# def get_patient_details_by_id(request):
#     # Get the dermatologist_id from query parameters
#     patient_id = request.query_params.get('patient_id')
#
#     if patient_id is not None:
#         patient_profile = PatientProfile.objects.get(user_id=patient_id)
#         if patient_profile:
#             serializer = PatientProfileSerializer(patient_profile)
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         else:
#             return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)
#     else:
#         return Response({"error": "Patient ID is required."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_patient_details_by_id(request):
    # Get the patient_id from query parameters
    patient_id = request.query_params.get('patient_id')

    if patient_id is not None:
        try:
            patient_profile = get_object_or_404(PatientProfile, user_id=patient_id)
            serializer = PatientProfileSerializer(patient_profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError:
            # Handle case where patient_id is not a valid integer
            return Response({"error": "Invalid patient ID format."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({"error": "Patient ID is required."}, status=status.HTTP_400_BAD_REQUEST)

# VIEWSET CLASSES
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


class PatientTreatmentViewSet(viewsets.ModelViewSet):
    """
        A viewset for viewing and editing patient treatment.
        """
    serializer_class = PatientTreatmentSerializer
    queryset = PatientTreatment.objects.all()
