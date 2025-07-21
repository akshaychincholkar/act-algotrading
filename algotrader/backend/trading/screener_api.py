from rest_framework.decorators import api_view
from .serializers import ScreenerSerializer
from requests import request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models.screener import Screener
from django.contrib.auth import get_user_model
from .utils.chartink_scan_clause import open_chartink_browser_and_print_scan_clause
from .utils.chartink_screener import fetch_chartink_screener
from .models.user import User
# Function-based view for Screener creation
@api_view(['GET', 'POST'])
def screener(request):
    if request.method == 'POST':
        data = request.data
        # Ensure data is a dict and has required fields
        if not isinstance(data, dict):
            return Response({'invalid': 'Invalid data. Expected a dictionary.'}, status=status.HTTP_400_BAD_REQUEST)
        screener_name = data.get('screener_name')
        user_id = data.get('user_id')
        if not screener_name or not user_id:
            return Response({'error': 'screener_name and user_id are required.'}, status=status.HTTP_400_BAD_REQUEST)
        # Generate scan_clause using Chartink logic
        try:
            scan_clause = open_chartink_browser_and_print_scan_clause(screener_name)
        except Exception as e:
            # Log the error and return a proper error response
            import logging
            logging.error(f"Failed to generate scan_clause for {screener_name}: {e}")
            return Response({'error': f'Failed to generate scan_clause: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ScreenerSerializer(data={
            'screener_name': str(screener_name),
            'user_id': str(user_id),
            'scan_clause': scan_clause
        })
        if serializer.is_valid():
            screener_obj = serializer.save()
            return Response({'success': True, 'screener_name': screener_obj.screener_name, 'scan_clause': screener_obj.scan_clause}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'GET':
        screeners = Screener.objects.all().order_by('-created_at')
        serializer = ScreenerSerializer(screeners, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# class ScreenerListAPI(APIView):
#     def get(self, request):
#         screeners = Screener.objects.all().order_by('-created_at')
#         data = [
#             {
#                 'screener_name': s.screener_name,
#                 'created_by': s.created_by.username if s.created_by else None,
#                 'created_at': s.created_at,
#                 'updated_at': s.updated_at,
#                 'last_run': s.last_run
#             }
#             for s in screeners
#         ]
#         return Response(data, status=status.HTTP_200_OK)

# class ScreenerAddAPI(APIView):
#     def post(self, request,*args, **kwargs):    
#         user = ScreenerUtils.print_user_name_by_id(request.data.get('user_id'))
#         ScreenerUtils.create_dummy_screener_for_user(user)
    # # def post(self, request,screener_name):
    #     # screener_name = request.data.get('screener_name')
    #     screener_name = kwargs.get('screener_name')
    #     user_id = request.data.get('user_id')
    #     if not user_id:
    #         return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    #     # Try to get user by id (primary key) or username
    #     try:
    #         user = User.objects.get(user_id=user_id)
    #     except User.DoesNotExist:
    #         return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    #     if not screener_name or not screener_name.strip():
    #         return Response({'error': 'Screener name required'}, status=status.HTTP_400_BAD_REQUEST)
    #     try:
    #         scan_clause = open_chartink_browser_and_print_scan_clause(screener_name)
    #         fetch_chartink_screener(scan_clause)  # Will raise if not found
    #     except Exception as e:
    #         return Response({'error': 'Screener not found or invalid: %s' % str(e)}, status=status.HTTP_404_NOT_FOUND)
    #     # Only set created_by if creating, not updating
    #     # screener, created = Screener.objects.get_or_create(
    #     #     screener_name=screener_name,
    #     #     defaults={
    #     #         'scan_clause': scan_clause,
    #     #         'created_by': user
    #     #     }
    #     # )
    #     # if not created:
    #     # # Only update scan_clause if changed
    #     # if screener.scan_clause != scan_clause:
    #     #     screener.scan_clause = scan_clause
    #     #     screener.save()
    #     # screener = Screener.objects.update_or_create(
    #     #     screener_name=screener_name,
    #     #     scan_clause=scan_clause,
    #     #     created_by=user
    #     # )
    #     screener = Screener.objects.update_or_create(
    #         created_by=user,
    #         defaults={
    #             'scan_clause': scan_clause,
    #             'screener_name': screener_name,
    #         }
    #     )
    #     return Response({'success': True, 'screener_name': screener.screener_name,}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ScreenerUtils:
    @staticmethod
    def print_user_name_by_id(user_id):
        try:
            user = User.objects.get(user_id=user_id)
            print(f"User name for user_id {user_id}: {user.user_name}")
            return user
        except User.DoesNotExist:
            print(f"User with user_id {user_id} does not exist.")
            return None

    @staticmethod
    def create_dummy_screener_for_user(user):
        if not user or not getattr(user, 'pk', None):
            print("No valid user provided. Cannot create screener.")
            return None
        try:
            screener = Screener.objects.create(
                screener_name="dummy_screener",
                scan_clause="dummy_scan_clause",
                created_by=user
            )
            print(f"Created Screener: {screener.screener_name} for user {user.user_name}")
            return screener
        except Exception as e:
            print(f"Failed to create screener: {e}")
            return None