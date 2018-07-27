# -*- coding: utf-8 -*-
from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import path, reverse
from django.utils.html import format_html
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
  * Gör alla fält readonly
  * Lägg till "merge changes"-knapp, som sätter merged=True och uppdaterar moder-Placet
  * Lista som default bara objekt med merged=False
  * Gör så att man får välja vilka fält som ska merge:as
"""
@admin.register(PlaceUserEdit)
class PlaceUserEditAdmin(admin.ModelAdmin):
    list_display = ('name', 'street_address', 'city', 'date_added', 'ip_address', 'merged',)
    ordering = ('merged', '-date_added',)
    save_on_top = True
    list_filter = ('merged',)

    class Media:
        css = { "all": ( "budgethak/admin/css/placeuseredit.css", ) }

    def street_address(self, obj):
        return obj.place.street_address
    def city(self, obj):
        return obj.place.city
    def original_name(self, obj):
        return obj.place.name
    def original_beer_price(self, obj):
        return obj.place.beer_price
    def original_beer_price_until(self, obj):
        return obj.place.beer_price_until
    def original_uteservering(self, obj):
        return obj.place.uteservering
    def original_image(self, obj):
        return format_html('<img src="%s" />' % (obj.place.image.url, ))

    def get_mergeable_fields(self, obj=None):
        field_names = ['name', 'beer_price', 'beer_price_until', 'uteservering', 'image', ]
        field_names_changed = []
        if obj:
            for field_name in field_names:
                value = str(getattr(obj, field_name))
                if value != '' and value != str(getattr(obj.place, field_name)):
                    # Fältet har ändrats
                    field_names_changed.append(field_name)
            return field_names_changed
        return field_names

    def get_fields(self, request, obj=None):
        field_names = self.get_mergeable_fields(obj)
        field_names = [(f, 'original_'+f) for f in field_names]
        field_names.extend([('user_comment', ), ('ip_address', 'date_added',)])
        return field_names

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [ path('<path:object_id>/merge/', self.merge, name="merge") ]
        return my_urls + urls

    def merge(self, request, object_id):
        import pdb; pdb.set_trace()
        obj = self.get_object(request, object_id)
        for field in self.get_mergeable_fields(obj):
            setattr(obj.place, field, getattr(obj, field))
        obj.place.save()
        obj.merged = True
        obj.save()
        return HttpResponseRedirect(reverse('admin:budgethak_placeuseredit_changelist'))

    def get_readonly_fields(self, request, obj=None):
        field_names = ['original_'+f for f in self.get_mergeable_fields(obj)]
        field_names.extend(['user_comment', 'ip_address', 'date_added'])
        return field_names

    def change_view(self, request, object_id, form_url='', extra_context=None):
        #import pdb; pdb.set_trace()
        extra_context = extra_context or {}
        obj = self.get_object(request, object_id)
        extra_context['place'] = obj.place
        return super().change_view(request, object_id, form_url, extra_context=extra_context)

