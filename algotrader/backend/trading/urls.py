from django.urls import path
from . import views

urlpatterns = [
    path('trades/', views.trades, name='trades'),
]