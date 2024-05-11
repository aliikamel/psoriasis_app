from django.db import models

from users.models import PatientTreatment


class SimulationResult(models.Model):
    # foreign key of PatientTreatment Instance
    treatment = models.ForeignKey(PatientTreatment, on_delete=models.CASCADE, related_name='simulation_results')
    simulation_date = models.DateField()
    simulation_data = models.JSONField()

    def __str__(self):
        return f"Simulation on {self.simulation_date} for {self.treatment}"
