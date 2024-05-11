from django.test import TestCase
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist
from users.models import *
from users.serializers import *


class UsersSerializersTest(TestCase):
    def setUp(self):
        # Set up user instances
        self.patient_user = CustomUser.objects.create_user(username='patient_user', password='test123', role='patient')
        self.dermatologist_user = CustomUser.objects.create_user(username='derm_user', password='test123',
                                                                 role='dermatologist')

        # Set up profiles
        self.patient_profile = PatientProfile.objects.create(user=self.patient_user)
        self.dermatologist_profile = DermatologistProfile.objects.create(user=self.dermatologist_user,
                                                                         license_number='D1234567')

    def test_custom_user_serializer(self):
        serializer_data = CustomUserSerializer(instance=self.patient_user).data
        self.assertEqual(serializer_data['username'], 'patient_user')
        self.assertNotIn('password', serializer_data)  # Password should not be serialized

    def test_patient_profile_serializer(self):
        serializer_data = PatientProfileSerializer(instance=self.patient_profile).data
        self.assertEqual(serializer_data['user']['username'], 'patient_user')
        self.assertEqual(serializer_data['user']['role'], 'patient')

    def test_dermatologist_profile_serializer(self):
        serializer_data = DermatologistProfileSerializer(instance=self.dermatologist_profile).data
        self.assertEqual(serializer_data['license_number'], 'D1234567')

    def test_user_create_serializer(self):
        # Test creation logic with transaction
        user_data = {
            'username': 'new_user',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'pass1234',
            'role': 'patient'
        }
        serializer = UserCreateSerializer(data=user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertIsInstance(user, CustomUser)
        self.assertEqual(user.username, 'new_user')
        # Verify profile creation based on role
        self.assertIsNotNone(PatientProfile.objects.get(user=user))

    def test_dermatologist_patient_relationship_serializer(self):
        # Testing validation and creation logic
        relationship_data = {'dermatologist_id': self.dermatologist_user.id, 'patient_id': self.patient_user.id}
        serializer = DermatologistPatientRelationshipSerializer(data=relationship_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        relationship = serializer.save()
        self.assertEqual(relationship.dermatologist, self.dermatologist_user)
        self.assertEqual(relationship.patient, self.patient_user)

        # Test invalid data submission
        invalid_data = {'dermatologist_id': self.patient_user.id,
                        'patient_id': self.dermatologist_user.id}  # Roles are swapped
        serializer = DermatologistPatientRelationshipSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
        self.assertEqual(str(serializer.errors['non_field_errors'][0]),
                         "Dermatologist with provided ID does not exist or is not a dermatologist.")

        # Attempt to create a duplicate relationship
        duplicate_data = {'dermatologist_id': self.dermatologist_user.id, 'patient_id': self.patient_user.id}
        duplicate_serializer = DermatologistPatientRelationshipSerializer(data=duplicate_data)
        self.assertFalse(duplicate_serializer.is_valid())
        self.assertIn('non_field_errors', duplicate_serializer.errors)
        self.assertEqual(str(duplicate_serializer.errors['non_field_errors'][0]), "This relationship already exists.")
