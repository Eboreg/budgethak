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
    
    class Meta:
        model = Place
        
        
class PlaceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ('pk', 'name', 'lat', 'lng', 'beer_price')