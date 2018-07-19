# -*- coding: utf-8 -*-

from .models import Place, OpeningHours, PlaceUserEdit, OpeningHoursUserEdit
from rest_framework import serializers


class OpeningHoursSerialiser(serializers.ModelSerializer):
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
        fields = ('weekday', 'opening_time', 'closing_time', 'closed_entire_day',)


class PlaceSerializer(serializers.ModelSerializer):
    opening_hours = OpeningHoursSerialiser(many=True)
    
    class Meta:
        model = Place
        fields = (
            'name', 'beer_price', 'beer_price_until', 'comment', 'uteservering', 'street_address', 'city',
            'open_now', 'image', 'opening_hours', 'slug',
        )


class PlaceUserEditSerializer(PlaceSerializer):
    beer_price = serializers.IntegerField(min_value=1, max_value=40)

    class Meta:
        model = PlaceUserEdit
        fields = (
            'name', 'beer_price', 'beer_price_until', 'comment', 'uteservering', 'opening_hours',
        )

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            if attr != 'opening_hours':
                setattr(instance, attr, value)
        instance.save()
        try:
            for day in validated_data['opening_hours']:
                oh = OpeningHoursUserEdit(place_user_edit=instance)
                for oh_attr in day:
                    setattr(oh, oh_attr, day[oh_attr])
                oh.save()
        except KeyError:
            pass
        return instance

        
class PlaceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        # Namn o adress behövs för autocomplete
        fields = ('slug', 'name', 'street_address', 'city', 'lat', 'lng', 'beer_price', 'open_now',)
