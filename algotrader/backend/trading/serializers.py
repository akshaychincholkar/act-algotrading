from .models.screener import Screener
from rest_framework import serializers
from .models import UserRoi, User, Trade
class ScreenerSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(write_only=True)
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    scan_clause = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="dummy_scan_clause")

    class Meta:
        model = Screener
        fields = [
            'user_id', 'screener_name', 'scan_clause', 'created_by', 'created_at', 'updated_at', 'last_run'
        ]
        extra_kwargs = {'created_by': {'read_only': True}}

    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        user = User.objects.get(user_id=user_id)
        if 'scan_clause' not in validated_data:
            validated_data['scan_clause'] = "dummy_scan_clause"
        screener = Screener.objects.create(created_by=user, **validated_data)
        return screener


class UserRoiSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(write_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)

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

class TradeSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    entry_date = serializers.DateField(
        format="%Y-%m-%d",
        input_formats=[
            "%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y",
            "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S", "iso-8601"
        ],
        required=False, allow_null=True
    )
    exit_date = serializers.DateField(
        format="%Y-%m-%d",
        input_formats=[
            "%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y",
            "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%S", "iso-8601"
        ],
        required=False, allow_null=True
    )

    class Meta:
        model = Trade
        fields = '__all__'
