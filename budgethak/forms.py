from django import forms
from django.core.exceptions import ValidationError
from .models import Place, OpeningHours
from .widgets import UserImageWidget

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
        fields = [ 'weekday', 'opening_time', 'closing_time', 'closed_entire_day', ]

    def clean(self):
        cleaned_data = super().clean()
        opening_time = cleaned_data.get('opening_time')
        closing_time = cleaned_data.get('closing_time')
        if (opening_time == None and closing_time != None) or (opening_time != None and closing_time == None):
            raise ValidationError("Både öppnings- och stängningstid måste vara angivna, eller ingen")
             

class UserImageForm(forms.ModelForm):
    image = forms.URLField(widget=UserImageWidget(upload_to='form-uploads'), label="Ny bild")

    class Meta:
        model = Place
        fields = ['image',]
