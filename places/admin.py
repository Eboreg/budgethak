# -*- coding: utf-8 -*-
from django.contrib import admin
from .models import Place, OpeningHours


class OpeningHoursInline(admin.TabularInline):
    model = OpeningHours
    extra = 7
    

class PlaceAdmin(admin.ModelAdmin):
    inlines = [OpeningHoursInline]
    list_display = ('name', 'street_address', 'city', 'beer_price', 'beer_price_until', 'date_updated')
    save_on_top = True
    fieldsets = (
        (None, {
            'fields' : ('name', 'lat', 'lng', 'street_address', 'city', 'beer_price', 'beer_price_until', 'uteservering', 'comment', 'image'),
            'classes' : ('half-size',),
            }),
        ('Tillfälligt stängt?', {
            'fields' : ('temporarily_closed_from', 'temporarily_closed_until'),
            'classes' : ('collapse',),
            }),
        )
    class Media:
        css = { "all": (
                        "admin/css/place.css", 
                        #"https://npmcdn.com/leaflet@0.7.7/dist/leaflet.css",
                        #"https://cdnjs.cloudflare.com/ajax/libs/leaflet-geocoder-mapzen/1.4.1/leaflet-geocoder-mapzen.css",
                        #"lib/L.GeoSearch/src/css/l.geosearch.css",
                        ) }
        js = (
              "admin/js/place.js",
              "https://maps.googleapis.com/maps/api/js?key=AIzaSyAiF3cmg81Ro5PHFY2iA3HOy5Hfx3Gs0Oc&libraries=places",
              )
    
    
admin.site.register(Place, PlaceAdmin)
