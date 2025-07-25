from django.db import models

class Authenticator(models.Model):
    user_id = models.CharField(max_length=20,primary_key=True,default=None,blank=False)
    api_key = models.TextField(default=None,blank=False)
    api_secret = models.TextField(default=None,blank=False)
    access_token = models.TextField(blank=True)
    last_login = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email_id} - {self.last_login}"
