from django.urls import path
from .screener_api import screener

urlpatterns = [
    path('screener/', screener, name='screener'),
]
