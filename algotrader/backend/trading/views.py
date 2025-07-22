from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Trade, GlobalParameters, User
from .serializers import TradeSerializer
from .models import GlobalParameters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
import json
from .utils.chartink_screener import fetch_chartink_screener
from .utils.kite_transaction_manager import place_market_order

@api_view(['GET', 'PUT', 'DELETE'])
def trade_detail(request, pk):
    try:
        trade = Trade.objects.get(pk=pk)
    except Trade.DoesNotExist:
        return Response({'error': 'Trade not found'}, status=404)

    if request.method == 'GET':
        serializer = TradeSerializer(trade)
        return Response(serializer.data)

    elif request.method == 'PUT':
        data = request.data.copy()
        user_id = data.get('user_id')
        if user_id:
            try:
                user_obj = User.objects.get(user_id=user_id)
                data['user'] = user_obj.pk
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=400)
        serializer = TradeSerializer(trade, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        trade.delete()
        return Response(status=204)

def create(self, request, *args, **kwargs):
        data = request.data.copy()
        user_id = data.get('user_id')
        if user_id:
            try:
                user_obj = User.objects.get(pk=user_id)
                data['user'] = user_obj.pk
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


@api_view(['GET', 'POST'])
def trades(request):
    if request.method == 'GET':
        user_id = request.query_params.get('user_id') or request.GET.get('user_id')
        if user_id:
            try:
                user_obj = User.objects.get(user_id=user_id)
                trades = Trade.objects.filter(user=user_obj)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=400)
        else:
            trades = Trade.objects.all()
        serializer = TradeSerializer(trades, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data.copy()
        user_id = data.get('user_id')
        if user_id:
            try:
                user_obj = User.objects.get(user_id=user_id)
                data['user'] = user_obj.pk
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=400)
        serializer = TradeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'POST'])
def global_parameters(request):
    if request.method == 'POST':
        key = request.data.get('key')
        value = request.data.get('value')
        if not key or not value:
            return Response({'error': 'key and value are required.'}, status=status.HTTP_400_BAD_REQUEST)
        param = GlobalParameters.objects.create(key=key, value=value)
        return Response({'key': param.key, 'value': param.value}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        key = request.GET.get('key')
        if not key:
            return Response({'error': 'key is required as query param.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            param = GlobalParameters.objects.get(key=key)
            return Response({'key': param.key, 'value': param.value}, status=status.HTTP_200_OK)
        except GlobalParameters.DoesNotExist:
            return Response({'error': 'Key not found.'}, status=status.HTTP_404_NOT_FOUND)

@csrf_exempt
@require_GET
def stocks_by_screener(request):
    """
    GET /stocks?screener_name=...  -> returns list of stocks for the screener_name
    """
    screener_name = request.GET.get('screener_name')
    if not screener_name:
        return JsonResponse({'error': 'Missing screener_name parameter'}, status=400)
    try:
        stocks = fetch_chartink_screener(screener_name)
        return JsonResponse({'stocks': stocks}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_POST
def buy_stock(request):
    """
    POST /stock/buy with JSON: {"user_id": ..., "stock_name": ..., "quantity": ...}
    """
    try:
        data = json.loads(request.body.decode())
        user_id = data.get("user_id")
        stock_name = data.get("stock_name")
        quantity = data.get("quantity")
        if not user_id or not stock_name or not quantity:
            return JsonResponse({"error": "Missing required parameters"}, status=400)
        place_market_order(user_id, stock_name, quantity, "BUY")
        return JsonResponse({"message": f"Buy order placed for {stock_name}, quantity {quantity}"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
