from django.urls import path, include
from . import views
from .views import trades, global_parameters, trade_detail
from .utils.generate_token_api import generate_token
from .views_user_roi import user_roi
from .screener_api import screener
from .views import stocks_by_screener
# from .screener_api import ScreenerListAPI, ScreenerAddAPI

urlpatterns = [
    path('trades/', views.trades, name='trades'),
    path('trades/<int:pk>/', views.trade_detail, name='trade_detail'),
    path('globalparameters/', global_parameters, name='global_parameters'),
    path('generate-token/', generate_token, name='generate_token'),
    path('user_roi/', user_roi, name='user-roi'),
    path('screener/', screener, name='screener'),
    path('stocks/', stocks_by_screener, name='stocks-by-screener'),
    # path('screener/<str:screener_name>/', ScreenerAddAPI.as_view(), name='screener-add'),
]