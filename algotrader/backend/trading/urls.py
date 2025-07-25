from django.urls import path, include
from . import views
from .views import trades, global_parameters, trade_detail
from .utils.generate_token_api import generate_token,check_token
from .utils.kite_authenticator import register_user, get_all_users, set_logged_in_user
from .views_user_roi import user_roi
from .screener_api import screener
from .views import stocks_by_screener, buy_stock

urlpatterns = [
    path('trades/', views.trades, name='trades'),
    path('trades/<int:pk>/', views.trade_detail, name='trade_detail'),
    path('globalparameters/', global_parameters, name='global_parameters'),
    path('generate-token/', generate_token, name='generate_token'),
    path('user_roi/', user_roi, name='user-roi'),
    path('screener/', screener, name='screener'),
    path('stocks/', stocks_by_screener, name='stocks-by-screener'),
    path('stock/buy', buy_stock, name='buy-stock'),
    path('check_token', check_token, name='check_token'),
    path('register-user', register_user, name='register-user'),
    path('users', get_all_users, name='get-all-users'),
    path('set-active-user/', set_logged_in_user, name='set-active-user'),
    # path('screener/<str:screener_name>/', ScreenerAddAPI.as_view(), name='screener-add'),
]