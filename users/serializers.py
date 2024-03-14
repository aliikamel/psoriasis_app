from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import CustomUser, PatientProfile, DermatologistProfile, DermatologistPatientRelationship, PatientTreatment


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'password', 'role', 'patient_profile',
                  'dermatologist_profile']
        extra_kwargs = {'password': {'write_only': True}}

    def get_patient_profile(self, obj):
        if hasattr(obj, 'patient_profile'):  # Assuming there's a reverse relation named 'patientprofile'
            profile = PatientProfile.objects.get(user=obj)
            return PatientProfileSerializer(profile).data
        elif hasattr(obj, 'dermatologist_profile'):  # Assuming there's a reverse relation named 'patientprofile'
            profile = DermatologistProfile.objects.get(user=obj)
            return DermatologistProfileSerializer(profile).data
        return None


class PatientTreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientTreatment
        fields = '__all__'  # Add more fields as you define them in your model


class PatientProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    treatment = PatientTreatmentSerializer(many=True, read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['user', 'dob', 'contact_number', 'medical_history', 'treatment']


class DermatologistProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = DermatologistProfile
        fields = ['user', 'license_number', 'specialization']


class DermatologistPatientRelationshipSerializer(serializers.ModelSerializer):
    dermatologist_id = serializers.IntegerField(write_only=True)
    patient_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = DermatologistPatientRelationship
        fields = ['id', 'dermatologist_id', 'patient_id']

    def to_representation(self, instance):
        # Custom representation to return IDs directly
        representation = super().to_representation(instance)
        representation['dermatologist_id'] = instance.dermatologist.id
        representation['patient_id'] = instance.patient.id
        return representation

    def validate(self, data):
        # Check if the provided IDs correspond to existing users with correct roles
        dermatologist = CustomUser.objects.filter(id=data['dermatologist_id'], role='dermatologist').first()
        patient = CustomUser.objects.filter(id=data['patient_id'], role='patient').first()

        if not dermatologist:
            raise ValidationError("Dermatologist with provided ID does not exist or is not a dermatologist.")
        if not patient:
            raise ValidationError("Patient with provided ID does not exist or is not a patient.")

        # Check for the existence of the relationship
        existing_relationship = DermatologistPatientRelationship.objects.filter(dermatologist=dermatologist,
                                                                                patient=patient).exists()
        if existing_relationship:
            raise ValidationError("This relationship already exists.")

        return data

    def create(self, validated_data):
        dermatologist_id = validated_data.pop('dermatologist_id')
        patient_id = validated_data.pop('patient_id')

        dermatologist = CustomUser.objects.get(id=dermatologist_id)
        patient = CustomUser.objects.get(id=patient_id)

        relationship = DermatologistPatientRelationship.objects.create(dermatologist=dermatologist, patient=patient)
        return relationship


class UserCreateSerializer(serializers.ModelSerializer):
    dob = serializers.DateField(write_only=True, required=False)
    license_number = serializers.CharField(write_only=True, required=False)
    specialization = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'password', 'role', 'dob', 'license_number',
                  'specialization']
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
