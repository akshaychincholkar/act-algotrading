# ...existing imports...
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..models import GlobalParameters
from ..models import User
import requests
import json
from kiteconnect import KiteConnect
from datetime import date
from ..models.authenticator import Authenticator

@csrf_exempt
def check_token(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            if not user_id:
                return JsonResponse({'error': 'user_id required'}, status=400)
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=404)
            last_login = user.last_login.date() if user.last_login else None
            if last_login == date.today():
                return JsonResponse({'message': 'Success'}, status=200)
            else:
                return JsonResponse({'error': 'Unauthorized'}, status=403)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid method'}, status=405)
    
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
    
    # Get user_id from GlobalParameters table with 'logged-in-user' key
    try:
        logged_in_user_param = GlobalParameters.objects.get(key='logged-in-user')
        user_id = logged_in_user_param.value
        if not user_id:
            return JsonResponse({'error': 'User is not registered as active due to some issue'}, status=400)
    except GlobalParameters.DoesNotExist:
        return JsonResponse({'error': 'User is not registered as active due to some issue'}, status=400)
    
    # Fetch api_key and api_secret for the user from Authenticator table
    
    try:
        auth = Authenticator.objects.get(user_id=user_id)
        api_key = auth.api_key
        api_secret = auth.api_secret
        
        # If api_key or api_secret is None/null/blank, return error immediately
        if not api_key or not api_secret:
            return JsonResponse({'error': 'API key/secret not found for user'}, status=404)
            
    except Authenticator.DoesNotExist:
        return JsonResponse({'error': f'User {user_id} not found in authenticator table'}, status=404)
    
    # Call Kite API to generate access token
    try:
        kite = KiteConnect(api_key=api_key)
        
        # Debug: Log the parameters being used
        print(f"Debug - API Key: {api_key[:10]}...")  # Only show first 10 chars for security
        print(f"Debug - Request Token: {request_token[:20]}...")  # Only show first 20 chars
        print(f"Debug - User ID: {user_id}")
        
        # Generate session with proper error handling
        session_data = kite.generate_session(request_token, api_secret=api_secret)
        access_token = session_data.get("access_token")
        
        if not access_token:
            return JsonResponse({
                'error': 'Failed to get access token from Kite',
                'details': 'Access token not found in response',
                'kite_response': session_data
            }, status=400)
            
        # Get user details using the access_token
        user_details = get_kite_user_details_internal(api_key, access_token)
        
        if 'error' in user_details:
            return JsonResponse({
                'error': 'Failed to get user details from Kite',
                'details': user_details['error']
            }, status=400)
        
        # Update User table with the user_id from frontend (not from Kite response)
        User.objects.update_or_create(
            user_id=user_id,  # Use the user_id from GlobalParameters
            defaults={
                'user_name': user_details.get('user_name', ''),
                'user_shortname': user_details.get('user_shortname', ''),
                'email': user_details.get('email', ''),
            }
        )
        
        # Update Authenticator table with access_token
        print(f"Debug - Saving access_token for user {user_id}: {access_token[:20]}...")  # Only show first 20 chars for security
        auth_update_result = Authenticator.objects.filter(user_id=user_id).update(
            access_token=access_token
        )
        print(f"Debug - Authenticator update result: {auth_update_result} record(s) updated")
        
        # Return response with the correct user_id
        return JsonResponse({
            'access_token': access_token, 
            'user': {
                **user_details,
                'user_id': user_id  # Ensure frontend gets the correct user_id
            }
        })
    except Exception as e:
        # Enhanced error handling with more details
        error_message = str(e)
        
        # Check for specific Kite API errors
        if "Invalid request token" in error_message:
            return JsonResponse({
                'error': 'Invalid or expired request token',
                'details': 'The request token may have expired or is invalid. Please try logging in again.',
                'kite_error': error_message
            }, status=400)
        elif "Invalid API credentials" in error_message or "403" in error_message:
            return JsonResponse({
                'error': 'Invalid API credentials',
                'details': f'API key or secret is incorrect for user {user_id}',
                'kite_error': error_message
            }, status=403)
        elif "checksum" in error_message.lower():
            return JsonResponse({
                'error': 'API secret mismatch',
                'details': 'The API secret does not match the API key. Please verify your credentials.',
                'kite_error': error_message
            }, status=400)
        else:
            return JsonResponse({
                'error': 'Kite API error',
                'details': error_message,
                'user_id': user_id,
                'api_key_prefix': api_key[:10] if api_key else 'None'
            }, status=500)
    
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
