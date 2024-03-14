from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import JSONField


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('dermatologist', 'Dermatologist'),
        ('researcher', 'Researcher'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    # Override the groups and user_permissions fields to specify unique related_names
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="customuser_groups",
        related_query_name="customuser",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="customuser_permissions",
        related_query_name="customuser",
    )


class PatientProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='patient_profile')
    dob = models.DateField(null=True, blank=True, verbose_name='Date of Birth')
    contact_number = models.CharField(max_length=15, blank=True, verbose_name='Contact Number')
    medical_history = models.TextField(blank=True, verbose_name='Medical History')


class DermatologistProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='dermatologist_profile')
    license_number = models.CharField(max_length=20, unique=True, verbose_name='License Number')
    specialization = models.CharField(max_length=100, blank=True, verbose_name='Specialization')
    # Add more dermatologist-specific fields as needed


class DermatologistPatientRelationship(models.Model):
    dermatologist = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='managed_patients')
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='managing_dermatologist')
    # Add relationship-specific fields here


class PatientTreatment(models.Model):
    patient_profile = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='treatment')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    treatment_type = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='not_started',
                              choices=[('active', 'Active'), ('completed', 'Completed'),
                                       ('not_started', 'Not Started')])
    treatment_plan = JSONField()


class SimulationResult(models.Model):
    treatment = models.ForeignKey(PatientTreatment, on_delete=models.CASCADE, related_name='simulation_results')
    simulation_date = models.DateField()
    simulation_data = models.JSONField()  # Assuming you're using Django 3.1+

    def __str__(self):
        return f"Simulation on {self.simulation_date} for {self.treatment}"
