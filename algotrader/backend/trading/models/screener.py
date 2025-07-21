from django.db import models
from django.contrib.auth import get_user_model
from .user import User


class Screener(models.Model):
    screener_name = models.CharField(max_length=200, primary_key=True)
    scan_clause = models.TextField(null=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_run = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.screener_name
