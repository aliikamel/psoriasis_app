from rest_framework import serializers
from .models import CustomUser, PatientProfile, DermatologistProfile, DermatologistPatientRelationship, PatientData


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id',
                  'first_name',
                  'last_name',
                  'username',
                  'email',
                  'role'
                  ]  # Include other fields as necessary


class PatientProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['user', 'dob', 'contact_number', 'address', 'medical_history']


class DermatologistProfileSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = DermatologistProfile
        fields = ['user', 'license_number', 'license_expiry_date', 'specialization']


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


# Define a serializer for creating users with a specific role
class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user
