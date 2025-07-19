from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import UserRoi, User
from .serializers import UserRoiSerializer

@api_view(['POST', 'GET'])
def user_roi(request):
    if request.method == 'GET':
        user_id = request.GET.get('user_id')
        if not user_id:
            return Response({'error': 'user_id query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(user_id=user_id)
            roi = UserRoi.objects.get(user=user)
            serializer = UserRoiSerializer(roi)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except UserRoi.DoesNotExist:
            return Response({'error': 'User ROI not found'}, status=status.HTTP_404_NOT_FOUND)
    # POST (create/update)
    serializer = UserRoiSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
