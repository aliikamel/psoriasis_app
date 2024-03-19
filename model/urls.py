from django.urls import path, include
from . import views

urlpatterns = [
    path('run-model/', views.run_model, name='run_model'),
    path('test-model/', views.test_model, name='test_model'),
    path('fit-uv-eff/', views.fit_uv_eff, name='fit_uv_eff'),
    path('simulate-model/', views.simulate_model, name='simulate_model'),
]

