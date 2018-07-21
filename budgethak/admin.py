# -*- coding: utf-8 -*-
from django.contrib import admin
from django.forms import ModelForm
from .models import Place, OpeningHours
from django.core.exceptions import ValidationError


class OpeningHoursInlineForm(ModelForm):
    def clean(self):
        cleaned_data = super(OpeningHoursInlineForm, self).clean()
        opening_time = cleaned_data.get('opening_time')
        closing_time = cleaned_data.get('closing_time')
        if (opening_time == None and closing_time != None) or (opening_time != None and closing_time == None):
            raise ValidationError("Både öppnings- och stängningstid måste vara angivna, eller ingen")
             
        
class OpeningHoursInline(admin.TabularInline):
    model = OpeningHours
    extra = 7
    form = OpeningHoursInlineForm
    

class PlaceAdmin(admin.ModelAdmin):
    inlines = [OpeningHoursInline]
    list_display = (
        'name', 'street_address', 'city', 'beer_price', 'beer_price_until', 'date_updated', 'visible'
    )
    save_on_top = True
    fieldsets = (
        (None, {
            'fields' : (
                'name', 'lat', 'lng', 'street_address', 'city', 'beer_price', 
                'beer_price_until', 'uteservering', 'comment', 'visible', 'image'
            ),
            'classes' : ('half-size',),
            }),
        ('Tillfälligt stängt?', {
            'fields' : ('temporarily_closed_from', 'temporarily_closed_until'),
            'classes' : ('collapse',),
            }),
        )
    class Media:
        css = { "all": (
                        "budgethak/admin/css/place.css", 
                        )
               }
        js = (
              "budgethak/admin/js/place.js",
              "https://maps.googleapis.com/maps/api/js?key=AIzaSyAiF3cmg81Ro5PHFY2iA3HOy5Hfx3Gs0Oc&libraries=places",
              )


admin.site.register(Place, PlaceAdmin)
