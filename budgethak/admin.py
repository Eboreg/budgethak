# -*- coding: utf-8 -*-
from django.contrib import admin
from .forms import OpeningHoursForm
from .models import Place, PlaceUserEdit, OpeningHours, OpeningHoursUserEdit

        
class OpeningHoursInline(admin.TabularInline):
    model = OpeningHours
    min_num = 7
    max_num = 7
    form = OpeningHoursForm
    

@admin.register(Place)
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
        css = { "all": ( "budgethak/admin/css/place.css", ) }
        js = (
              "budgethak/admin/js/place.js",
              "https://maps.googleapis.com/maps/api/js?key=AIzaSyAiF3cmg81Ro5PHFY2iA3HOy5Hfx3Gs0Oc&libraries=places",
              )


"""
TODO:
  * Visa bara de attribut som har ändrats, och vad de var innan
  * Gör alla fält readonly
  * Lägg till "merge changes"-knapp, som sätter merged=True och uppdaterar moder-Placet
  * Lista som default bara objekt med merged=False
  * Gör så att man får välja vilka fält som ska merge:as
"""
@admin.register(PlaceUserEdit)
class PlaceUserEditAdmin(admin.ModelAdmin):
    list_display = ('name', 'street_address', 'city', 'date_added', 'ip_address', )
    ordering = ('-date_added',)
    save_on_top = True

    def street_address(self, obj):
        return obj.place.street_address

    def city(self, obj):
        return obj.place.city
