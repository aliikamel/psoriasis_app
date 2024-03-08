from django.db import transaction
from rest_framework import serializers
from .models import CustomUser, PatientProfile, DermatologistProfile, DermatologistPatientRelationship, PatientData


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'first_name', 'last_name', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}


class PatientProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['user', 'dob', 'contact_number', 'address', 'medical_history']


class DermatologistProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = DermatologistProfile
        fields = ['user', 'license_number', 'specialization']


class DermatologistPatientRelationshipSerializer(serializers.ModelSerializer):
    dermatologist = CustomUserSerializer(read_only=True)
    patient = CustomUserSerializer(read_only=True)

    class Meta:
        model = DermatologistPatientRelationship
        fields = ['dermatologist', 'patient']


class PatientDataSerializer(serializers.ModelSerializer):
    patient_profile = PatientProfileSerializer(read_only=True)

    class Meta:
        model = PatientData
        fields = ['patient_profile']  # Add more fields as you define them in your model


class UserCreateSerializer(serializers.ModelSerializer):
    dob = serializers.DateField(write_only=True, required=False)
    license_number = serializers.CharField(write_only=True, required=False)
    specialization = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = ['username', 'first_name', 'last_name', 'password', 'role', 'dob', 'license_number', 'specialization']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role = validated_data.pop('role', None)

        # Using transaction.atomic to ensure database integrity during multi-step creation
        with transaction.atomic():
            user = CustomUser.objects.create_user(
                username=validated_data['username'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                password=validated_data['password'],
            )
            user.role = role
            user.save()

            if role == 'patient':
                PatientProfile.objects.create(
                    user=user,
                )
            elif role == 'dermatologist':
                DermatologistProfile.objects.create(
                    user=user,
                    license_number=validated_data.get('license_number', None),
                )
            # Handle other roles as necessary

        return user
