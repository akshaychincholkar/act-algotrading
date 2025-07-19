from django.db import models

class Authenticator(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, primary_key=True)
    access_token = models.TextField()
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email_id} - {self.date}"
