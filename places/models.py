# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from django.db import models
from django.utils.dates import WEEKDAYS
from ajaximage.fields import AjaxImageField
from autoslug import AutoSlugField
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
    slug = AutoSlugField(unique=True, populate_from=lambda place: "-".join((place.name, place.city)))
    
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
        
    def is_open_now(self):
        """ Returnerar None om okänt. """
        now = datetime.now()
        current_weekday = now.weekday()
        if current_weekday == 0:
            weekday_yesterday = 6
        else:
            weekday_yesterday = current_weekday - 1
        current_time = now.time()
        # Loopa igenom platsens OpeningHours:
        for day in self.opening_hours.all():
            # Loopa igenom veckodagarna inom aktuell öppettid-post:
            for weekday in range(day.start_weekday, day.end_weekday + 1):
                # Om det t.ex. är lördag kl. 01:00 och stängningstid för fredag är 02:00 -> öppet nu:
                if weekday == weekday_yesterday and day.closing_time < day.opening_time and current_time < day.closing_time:
                    return True
                elif weekday == current_weekday:
                    if day.closing_time < day.opening_time and current_time >= day.opening_time:
                        return True
                    elif day.opening_time <= current_time < day.closing_time:
                        return True
                    else:
                        return False 
        return None
    
    
class OpeningHours(models.Model):
    place = models.ForeignKey('Place', on_delete=models.CASCADE, related_name='opening_hours')
    start_weekday = models.PositiveSmallIntegerField(choices=WEEKDAYS.items(), default=0)
    end_weekday = models.PositiveSmallIntegerField(choices=WEEKDAYS.items(), default=0)
    opening_time = models.TimeField()
    closing_time = models.TimeField()

    def save(self, *args, **kwargs):
        if self.start_weekday > self.end_weekday:
            self.end_weekday = self.start_weekday
        return super(OpeningHours, self).save(*args, **kwargs)
