from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from users.models import *
from users.serializers import CustomUserSerializer
from django.contrib.auth import get_user_model


class UsersViewsTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testuser',
            'password': 'password1234',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'patient',
        }
        self.user_url = reverse('create_user')

    # create a user and verify the success and response data
    def test_create_user(self):
        response = self.client.post(self.user_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], self.user_data['username'])
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    #  testing relationships are created correctly and handle errors such as invalid data
    def test_create_patient_dermatologist_relationship(self):
        patient = CustomUser.objects.create(username='patient1', role='patient')
        dermatologist = CustomUser.objects.create(username='dermatologist1', role='dermatologist')
        relationship_data = {
            'patient_id': patient.id,
            'dermatologist_id': dermatologist.id
        }
        relationship_url = reverse('create_patient_dermatologist_relationship')
        response = self.client.post(relationship_url, relationship_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['patient'], patient.id)
        self.assertEqual(response.data['dermatologist'], dermatologist.id)

        # Test for invalid relationship creation
        invalid_data = relationship_data.copy()
        invalid_data['patient_id'] = 999  # non-existent user
        response = self.client.post(relationship_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # check if treatments are correctly handled, including validation for date formats
    def test_create_patient_treatment(self):
        patient = CustomUser.objects.create(username='patient2', role='patient')
        patient_profile = PatientProfile.objects.create(user=patient)
        treatment_url = reverse('create_patient_treatment')
        treatment_data = {
            'patient_profile_id': patient_profile.id,
            'pasi_pre_treatment_date': '01/01/2020',
            'start_date': '01/02/2020',
            'num_of_weeks': 4,
            'weekly_sessions': 3,
            'med': 1.0,
            'pasi_pre_treatment': 2.5
        }
        response = self.client.post(treatment_url, treatment_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Test for non-existent patient profile
        invalid_treatment_data = treatment_data.copy()
        invalid_treatment_data['patient_profile_id'] = 9999  # Invalid ID
        response = self.client.post(treatment_url, invalid_treatment_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # testing the update functionality, and handling edge cases like non-existent treatment IDs.
    def test_update_patient_treatment(self):
        # Creating initial data
        patient = CustomUser.objects.create(username='patient3', role='patient')
        patient_profile = PatientProfile.objects.create(user=patient)
        treatment_plan = {
            'patient_profile_id': patient_profile.id,
            'pasi_pre_treatment_date': '01/01/2020',
            'start_date': '01/02/2020',
            'num_of_weeks': 4,
            'weekly_sessions': 3,
            'med': 1.0,
            'pasi_pre_treatment': 2.5
        }
        treatment = PatientTreatment.objects.create(patient_profile=patient_profile, start_date='2020-01-01',
                                                    end_date='2020-02-01', treatment_plan=treatment_plan)

        update_url = reverse('update_patient_treatment')
        update_data = {
            'treatment': {
                'id': treatment.id,
                'treatment_plan': {'new_plan': 'Updated plan details'}
            }
        }

        response = self.client.post(update_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        treatment.refresh_from_db()
        self.assertEqual(treatment.treatment_plan['new_plan'], 'Updated plan details')

        # Testing non-existent treatment update
        update_data['treatment']['id'] = 9999
        response = self.client.post(update_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # verify that the correct list of patients is returned based on a dermatologist's ID
    def test_get_patients_managed(self):
        dermatologist = CustomUser.objects.create(username='derm2', role='dermatologist')
        patient = CustomUser.objects.create(username='patient4', role='patient')
        relationship = DermatologistPatientRelationship.objects.create(dermatologist=dermatologist, patient=patient)

        managed_url = reverse('get_patients_managed')

        # Valid request with dermatologist_id
        response = self.client.get(managed_url, {'dermatologist_id': dermatologist.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], patient.username)

        # Request without dermatologist_id
        response = self.client.get(managed_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_get_patient_details_by_id(self):
        # Create a patient user and associated patient profile
        patient = CustomUser.objects.create(username='patient5', role='patient')
        patient_profile = PatientProfile.objects.create(user=patient)

        details_url = reverse('get_patient_details_by_id')

        # Valid request with patient_id
        response = self.client.get(details_url, {'patient_id': patient.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['username'], patient.username)

        # Request with non-existent patient_id
        # Assuming 9999 is an ID that does not exist
        response = self.client.get(details_url, {'patient_id': 9999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Request without patient_id
        response = self.client.get(details_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

        # Invalid patient_id format (e.g., string instead of an integer)
        response = self.client.get(details_url, {'patient_id': 'invalid_id'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

        # Valid request with user_id but user is not a patient
        non_patient_user = CustomUser.objects.create(username='non_patient', role='admin')
        response = self.client.get(details_url, {'patient_id': non_patient_user.id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
