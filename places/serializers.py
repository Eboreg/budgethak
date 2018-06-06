# -*- coding: utf-8 -*-

from .models import Place, OpeningHours
from rest_framework import serializers


class OpeningHoursSerialiser(serializers.ModelSerializer):
    opening_time = serializers.TimeField(format='%H:%M', input_formats='%H:%M')
    closing_time = serializers.TimeField(format='%H:%M', input_formats='%H:%M')
    
    def __init__(self, *args, **kwargs):
        super(OpeningHoursSerialiser, self).__init__(*args, **kwargs)
        # CP-bugg någonstans gör att tidpunkten 00:00 tolkas som None här och sedermera null i JSON.
        # Går nu runt det genom att köra i template: print(opening_time || '00:00') osv. 
        # "Lösningen" nedan funkar ej pga min inkompetens, kanske ta tag i senare?
        '''
        if self.fields['closed_entire_day'] == False:
            if self.fields['opening_time'] == None:
                self.fields['opening_time'] = '00:00'
            if self.fields['closing_time'] == 0:
                self.fields['closing_time'] = '00:00'
        '''
    
    class Meta:
        model = OpeningHours
        fields = ('start_weekday', 'end_weekday', 'opening_time', 'closing_time', 'closed_entire_day',)


class PlaceSerializer(serializers.ModelSerializer):
    opening_hours = OpeningHoursSerialiser(many=True)
    beer_price_until = serializers.TimeField(format='%H:%M')
    open_now = serializers.SerializerMethodField()
    
    class Meta:
        model = Place
        fields = '__all__'
        
    def get_open_now(self, obj):
        return obj.is_open_now()

        
class PlaceListSerializer(serializers.ModelSerializer):
    open_now = serializers.SerializerMethodField()
    
    class Meta:
        model = Place
        fields = ('slug', 'name', 'street_address', 'city', 'lat', 'lng', 'beer_price', 'open_now',)
        
    def get_open_now(self, obj):
        return obj.is_open_now()
    