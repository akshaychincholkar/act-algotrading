from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Trade
from .serializers import TradeSerializer

@api_view(['GET', 'POST'])
def trades(request):
    if request.method == 'GET':
        trades = Trade.objects.all()
        serializer = TradeSerializer(trades, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = TradeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
