from __future__ import unicode_literals

from django.db import models
from django.utils.dates import WEEKDAYS
from django.template.defaultfilters import slugify
from ajaximage.fields import AjaxImageField
from datetime import datetime


class Place(models.Model):
    name = models.CharField(max_length=50)
    lat = models.DecimalField(decimal_places=7, max_digits=10)
    lng = models.DecimalField(decimal_places=7, max_digits=10)
    street_address = models.CharField(max_length=200)
    neighbourhood = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=50)
    beer_price = models.PositiveSmallIntegerField(null=True, blank=True)
    beer_price_until = models.TimeField(blank=True, null=True)
    comment = models.TextField(blank=True)
    uteservering = models.NullBooleanField()
    temporarily_closed_from = models.DateField(null=True, blank=True)
    temporarily_closed_until = models.DateField(null=True, blank=True)
    date_published = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    image = AjaxImageField(upload_to="place_images", max_width=1024, null=True, blank=True) 
    slug = models.SlugField(max_length=55, editable=False, default='')
    
    def save(self, *args, **kwargs):
        if not self.id:
            self.slug = '-'.join([slugify(self.name), str(self.id)])
        super(Place, self).save(*args, **kwargs)
        
    def is_temporarily_closed(self):
        current_date = datetime.now().date() 
        if self.temporarily_closed_from == None and self.temporarily_closed_until == None:
            return False
        elif self.temporarily_closed_from == None and self.temporarily_closed_until >= current_date:
            return True
        elif self.temporarily_closed_from <= current_date and self.temporarily_closed_until == None:
            return True
        elif self.temporarily_closed_from <= current_date and self.temporarily_closed_until >= current_date:
            return True
        else:
            return False     
        
    
class OpeningHours(models.Model):
    place = models.ForeignKey('Place', on_delete=models.CASCADE, related_name='opening_hours')
    start_weekday = models.PositiveSmallIntegerField(choices=WEEKDAYS.items(), default=0)
    end_weekday = models.PositiveSmallIntegerField(choices=WEEKDAYS.items(), default=0)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
