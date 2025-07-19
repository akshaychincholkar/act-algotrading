# ...existing imports...
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..models import GlobalParameters
from ..models import User
import requests
import json
from kiteconnect import KiteConnect

def get_kite_user_details_internal(api_key, access_token):
    url = 'https://api.kite.trade/user/profile'
    headers = {
        'X-Kite-Version': '3',
        'Authorization': f'token {api_key}:{access_token}'
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        user_data = response.json().get('data', {})
        return user_data
    except Exception as e:
        return {'error': str(e)}

@csrf_exempt
def generate_token(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    data = json.loads(request.body.decode('utf-8'))
    request_token = data.get('request_token')
    if not request_token:
        return JsonResponse({'error': 'request_token required'}, status=400)
    # Fetch api_key and api_secret from GlobalParameters
    try:
        api_key = GlobalParameters.objects.get(key='api_key').value
        api_secret = GlobalParameters.objects.get(key='api_secret').value
    except GlobalParameters.DoesNotExist:
        return JsonResponse({'error': 'API key/secret not found'}, status=404)
    # Call Kite API to generate access token
    url = 'https://api.kite.trade/session/token'
    payload = {
        'api_key': api_key,
        'request_token': request_token,
        'api_secret': api_secret
    }
    headers = {'X-Kite-Version': '3'}
    try:
        # response = requests.post(url, data=payload, headers=headers)
        # response.raise_for_status()
        # access_token = response.json().get('data', {}).get('access_token')
        kite = KiteConnect(api_key=api_key)
        data = kite.generate_session(request_token, api_secret=api_secret)
        access_token = data["access_token"]        
        if not access_token:
            return JsonResponse({'error': 'Failed to get access token', 'details': {data}}, status=400)
        # Get user details using the access_token
        user_details = get_kite_user_details_internal(api_key, access_token)
        User.objects.update_or_create(
            user_id=user_details.get('user_id', ''),
            defaults={
                'user_name': user_details.get('user_name', ''),
                'user_shortname': user_details.get('user_shortname', ''),
                'email': user_details.get('email', ''),
                'access_token': access_token
            }
        )
        return JsonResponse({'access_token': access_token, 'user': user_details})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
    ########################################################################
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from ..models import GlobalParameters
# import requests
# import json
# from kiteconnect import KiteConnect
# @csrf_exempt
# def get_kite_user_details(request):
#     if request.method != 'POST':
#         return JsonResponse({'error': 'POST required'}, status=405)
#     data = json.loads(request.body.decode('utf-8'))
#     access_token = data.get('access_token')
#     if not access_token:
#         return JsonResponse({'error': 'access_token required'}, status=400)
#     # Fetch api_key from GlobalParameters
#     try:
#         api_key = GlobalParameters.objects.get(key='api_key').value
#     except GlobalParameters.DoesNotExist:
#         return JsonResponse({'error': 'API key not found'}, status=404)
#     # Call Kite API to get user details
#     url = 'https://api.kite.trade/user/profile'
#     headers = {
#         'X-Kite-Version': '3',
#         'Authorization': f'token {api_key}:{access_token}'
#     }
#     try:
#         response = requests.get(url, headers=headers)
#         response.raise_for_status()
#         user_data = response.json().get('data', {})
#         return JsonResponse({'user': user_data})
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)


# @csrf_exempt
# def generate_token(request):
#     if request.method != 'POST':
#         return JsonResponse({'error': 'POST required'}, status=405)
#     data = json.loads(request.body.decode('utf-8'))
#     request_token = data.get('request_token')
#     if not request_token:
#         return JsonResponse({'error': 'request_token required'}, status=400)
#     # Fetch api_key and api_secret from GlobalParameters
#     try:
#         api_key = GlobalParameters.objects.get(key='api_key').value
#         api_secret = GlobalParameters.objects.get(key='api_secret').value
#     except GlobalParameters.DoesNotExist:
#         return JsonResponse({'error': 'API key/secret not found'}, status=404)
#     # Call Kite API to generate access token
#     url = 'https://api.kite.trade/session/token'
#     payload = {
#         'api_key': api_key,
#         'request_token': request_token,
#         'api_secret': api_secret
#     }
#     headers = {'X-Kite-Version': '3'}
#     try:
#         kite = KiteConnect(api_key=api_key)
#         data = kite.generate_session(request_token, api_secret=api_secret)
#         access_token = data["access_token"]
#         # response = requests.post(url, data=payload, headers=headers)
#         # response.raise_for_status()
#         # access_token = response.json().get('data', {}).get('access_token')
#         # if not access_token:
#         #     return JsonResponse({'error': 'Failed to get access token', 'details': response.json()}, status=400)
#         return JsonResponse({'access_token': access_token})
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)
