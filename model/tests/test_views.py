from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
import json
import numpy as np


class ModelViewsTest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.fit_uv_eff_url = reverse('fit_uv_eff')
        self.simulate_model_url = reverse('simulate_model')
        self.user = get_user_model().objects.create_user(username='user', password='pass')
        self.client.force_authenticate(user=self.user)

        self.sample_data_fit_uv_eff = {
            "WEEKS": [
                {
                    "status": "completed",
                    "uv_eff": 0.97,
                    "session_1": {"date": "05/05/2024", "actual_dose": 1, "planned_dose": 0.7},
                    "session_2": {"date": "07/05/2024", "actual_dose": 1, "planned_dose": 0.7},
                    "session_3": {"date": "10/05/2024", "actual_dose": 1, "planned_dose": 0.98},
                    "end_week_pasi": 2
                }
            ],
            "WEEKLY_SESSIONS": 3,
            "PASI_PRE_TREATMENT": 19.72,
            "TREATMENT_END_DATE": "28/07/2024",
            "TREATMENT_START_DATE": "05/05/2024",
            "PASI_PRE_TREATMENT_DATE": "01/05/2024"
        }

        self.sample_data_simulate_model = {
            "treatment": {
                "treatment_plan": self.sample_data_fit_uv_eff
            },
            "uv_eff": 0.95
        }

    @patch('model.views.prepare_matlab')
    @patch('model.views.matlab.double', side_effect=lambda x: x)
    def test_fit_uv_eff(self, mock_matlab_double, mock_prepare_matlab):
        # Mock the MATLAB engine's methods
        mock_model, mock_eng = MagicMock(), MagicMock()
        mock_eng.find_uv_eff.return_value = 0.75
        mock_prepare_matlab.return_value = (mock_model, mock_eng)

        response = self.client.post(self.fit_uv_eff_url, json.dumps(self.sample_data_fit_uv_eff),
                                    content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertJSONEqual(str(response.content, encoding='utf8'), {"best_uv_eff": 0.75})

        # Test for empty WEEKS
        response = self.client.post(self.fit_uv_eff_url, json.dumps({"WEEKS": []}), content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
