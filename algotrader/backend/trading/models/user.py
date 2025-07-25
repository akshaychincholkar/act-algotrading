from django.db import models

class User(models.Model):
    user_name = models.CharField(max_length=50, blank=True, null=True)
    user_shortname = models.CharField(max_length=50, blank=True, null=True)
    user_id = models.CharField(max_length=20)
    email = models.EmailField()

    def __str__(self):
        return f"{self.user_name} ({self.email})"
