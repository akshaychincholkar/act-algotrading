from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from ..models.authenticator import Authenticator
from ..models import GlobalParameters
@csrf_exempt
def get_all_users(request):
    if request.method == 'GET':
        try:
            users = list(Authenticator.objects.values('user_id', 'api_key'))
            return JsonResponse({'users': users}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            api_key = data.get('api_key')
            api_secret = data.get('api_secret')
            user_id = data.get('user_id')

            if not all([api_key, api_secret, user_id]):
                return JsonResponse({'error': 'Missing required fields'}, status=400)

            # Create or update Authenticator entry
            obj, created = Authenticator.objects.update_or_create(
                user_id=user_id,
                defaults={
                    'api_key': api_key,
                    'api_secret': api_secret
                }
            )
            return JsonResponse({'message': 'User registered successfully', 'created': created}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def set_logged_in_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id')
            is_active = data.get('isActive')

            if user_id is None or is_active is None:
                return JsonResponse({'error': 'Missing required fields: user_id and isActive'}, status=400)

            if is_active:
                # Set the logged-in user
                GlobalParameters.objects.update_or_create(
                    key='logged-in-user',
                    defaults={'value': user_id}
                )
                message = f'User {user_id} set as active logged-in user'
            else:
                # Clear the logged-in user (set to None)
                GlobalParameters.objects.update_or_create(
                    key='logged-in-user',
                    defaults={'value': None}
                )
                message = 'Logged-in user cleared'

            return JsonResponse({'message': message}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
