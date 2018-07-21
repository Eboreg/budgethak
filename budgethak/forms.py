from django import forms
from ajaximage.fields import AjaxImageField
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
            'weekday', 'opening_time', 'closing_time', 'closed_entire_day',
        ]

class UserImageForm(forms.ModelForm):
#    image = AjaxImageField(upload_to="place_images", max_width=1024, null=True, blank=True) 

    class Meta:
        model = Place
        fields = ['image',]
