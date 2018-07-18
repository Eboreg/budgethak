from django import forms
from .models import Place, PlaceUserEdit, OpeningHours

class PlaceForm(forms.ModelForm):
    class Meta:
        model = Place
        fields = [
            'name', 'street_address', 'city', 'beer_price', 'beer_price_until', 'comment', 
            'uteservering', 'temporarily_closed_from', 'temporarily_closed_until', 'image',
        ]

class OpeningHoursForm(forms.ModelForm):
    class Meta:
        model = OpeningHours
        fields = [
            'start_weekday', 'end_weekday', 'opening_time', 'closing_time', 'closed_entire_day',
        ]
