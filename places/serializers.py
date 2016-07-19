from .models import Place, OpeningHours
from rest_framework import serializers


class OpeningHoursSerialiser(serializers.ModelSerializer):
    opening_time = serializers.TimeField(format='%H:%M')
    closing_time = serializers.TimeField(format='%H:%M')
    class Meta:
        model = OpeningHours
        fields = ('start_weekday', 'end_weekday', 'opening_time', 'closing_time',)


class PlaceSerializer(serializers.ModelSerializer):
    opening_hours = OpeningHoursSerialiser(many=True)
    beer_price_until = serializers.TimeField(format='%H:%M')
    open_now = serializers.SerializerMethodField()
    
    class Meta:
        model = Place
        
    def get_open_now(self, obj):
        return obj.is_open_now()

        
class PlaceListSerializer(serializers.ModelSerializer):
    open_now = serializers.SerializerMethodField()
    
    class Meta:
        model = Place
        fields = ('pk', 'name', 'lat', 'lng', 'beer_price', 'open_now',)
        
    def get_open_now(self, obj):
        return obj.is_open_now()
    