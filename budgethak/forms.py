from django import forms
from django.db import models
from ajaximage.widgets import AjaxImageWidget
from .models import Place, PlaceUserEdit, OpeningHours
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
        fields = [
            'weekday', 'opening_time', 'closing_time', 'closed_entire_day',
        ]

class UserImageForm(forms.ModelForm):
    image = forms.URLField(widget=UserImageWidget(upload_to='form-uploads'), label="Ny bild")

    class Meta:
        model = Place
        fields = ['image',]
