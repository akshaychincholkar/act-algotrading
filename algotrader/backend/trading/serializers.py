from rest_framework import serializers
from .models import Trade

class TradeSerializer(serializers.ModelSerializer):
    entry_date = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S", "iso-8601"], required=False, allow_null=True)
    exit_date = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S", "iso-8601"], required=False, allow_null=True)

    class Meta:
        model = Trade
        fields = '__all__'
