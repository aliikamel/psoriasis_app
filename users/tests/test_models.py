from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from users.models import *


class UserModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up users used by all test methods
        CustomUser.objects.create_user(username='patient_user', password='test1234', role='patient')
        CustomUser.objects.create_user(username='dermatologist_user', password='test1234', role='dermatologist')
        CustomUser.objects.create_user(username='researcher_user', password='test1234', role='researcher')

    def test_user_creation(self):
        patient = CustomUser.objects.get(username='patient_user')
        dermatologist = CustomUser.objects.get(username='dermatologist_user')
        researcher = CustomUser.objects.get(username='researcher_user')
        self.assertEqual(patient.role, 'patient')
        self.assertEqual(dermatologist.role, 'dermatologist')
        self.assertEqual(researcher.role, 'researcher')

    def test_patient_profile_creation(self):
        user = CustomUser.objects.get(username='patient_user')
        PatientProfile.objects.create(user=user, dob='1990-01-01', contact_number='1234567890',
                                      medical_history='No history')
        profile = PatientProfile.objects.get(user=user)
        self.assertEqual(profile.contact_number, '1234567890')

    def test_dermatologist_profile_creation(self):
        user = CustomUser.objects.get(username='dermatologist_user')
        DermatologistProfile.objects.create(user=user, license_number='Lic1234', specialization='Dermatology')
        profile = DermatologistProfile.objects.get(user=user)
        self.assertEqual(profile.license_number, 'Lic1234')

    def test_dermatologist_patient_relationship(self):
        patient = CustomUser.objects.get(username='patient_user')
        dermatologist = CustomUser.objects.get(username='dermatologist_user')
        relationship = DermatologistPatientRelationship.objects.create(patient=patient, dermatologist=dermatologist)

        self.assertEqual(relationship.patient, patient)
        self.assertEqual(relationship.dermatologist, dermatologist)

    def test_unique_license_number(self):
        user1 = CustomUser.objects.get(username='dermatologist_user')
        DermatologistProfile.objects.create(user=user1, license_number='Lic1235')
        with self.assertRaises(IntegrityError):
            user2 = CustomUser.objects.create_user(username='another_dermatologist_user', password='test12345',
                                                   role='dermatologist')
            DermatologistProfile.objects.create(user=user2, license_number='Lic1235')

    def test_patient_treatment(self):
        patient = CustomUser.objects.get(username='patient_user')
        profile = PatientProfile.objects.create(user=patient)

        treatment_plan = {
            "WEEKS": [
                {
                    "status": "completed",
                    "uv_eff": 0.97,
                    "session_1": {"date": "2024-05-05", "actual_dose": 1, "planned_dose": 0.7},
                    "session_2": {"date": "2024-05-07", "actual_dose": 1, "planned_dose": 0.7},
                    "session_3": {"date": "2024-05-09", "actual_dose": 1, "planned_dose": 0.98},
                    "end_week_pasi": 2
                }
            ],
            "WEEKLY_SESSIONS": 3,
            "PASI_PRE_TREATMENT": 19.72,
            "TREATMENT_END_DATE": "2024-07-28",
            "TREATMENT_START_DATE": "2024-05-05",
            "PASI_PRE_TREATMENT_DATE": "2024-05-01"
        }

        # Create the first treatment
        treatment = PatientTreatment(patient_profile=profile, start_date='2024-05-05',
                                     treatment_plan=treatment_plan)
        treatment.clean()
        treatment.save()

        # Attempt to create a second treatment and expect a ValidationError
        new_treatment = PatientTreatment(patient_profile=profile, start_date='2024-05-06',
                                         treatment_plan=treatment_plan)
        with self.assertRaises(ValidationError):
            new_treatment.clean()
            new_treatment.save()