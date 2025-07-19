from rest_framework import serializers
from .models import UserRoi, User

class UserRoiSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(write_only=True)
    class Meta:
        model = UserRoi
        fields = [
            'user_id', 'total_capital', 'risk', 'total_risk', 'diversification', 'ipt', 'rpt', 'invested',
            'monthly_pl', 'tax_pl', 'donation_pl', 'monthly_gain', 'monthly_percent_gain', 'total_gain', 'total_percert_gain', 'user'
        ]
        extra_kwargs = {'user': {'read_only': True}}

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        user = User.objects.get(user_id=user_id)
        # If ROI already exists for this user, update it
        obj, created = UserRoi.objects.update_or_create(user=user, defaults=validated_data)
        return obj
from rest_framework import serializers
from .models import Trade, User

class TradeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    entry_date = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S", "iso-8601"], required=False, allow_null=True)
    exit_date = serializers.DateField(format="%Y-%m-%d", input_formats=["%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S", "iso-8601"], required=False, allow_null=True)

    class Meta:
        model = Trade
        fields = '__all__'
