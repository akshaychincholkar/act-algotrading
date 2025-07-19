from django.urls import path
from .views_user_roi import user_roi

urlpatterns = [
    path('user_roi/', user_roi, name='user-roi'),
]
