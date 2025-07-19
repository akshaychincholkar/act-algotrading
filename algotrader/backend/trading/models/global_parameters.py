from django.db import models

class GlobalParameters(models.Model):
    # This model can be used to store global parameters for the application
    # For example, you can store API keys, thresholds, or other configuration settings  
    key = models.TextField(max_length=250, primary_key=True)
    value = models.TextField(max_length=512, blank=True, null=True)
    def __str__(self):
        return f"{self.key} - {self.value}"
