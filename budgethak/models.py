# -*- coding: utf-8 -*-

from __future__ import unicode_literals
import os

from django.conf import settings
from django.db import models
from django.utils.dates import WEEKDAYS
from django.utils.translation import gettext as _
from ajaximage.fields import AjaxImageField
from autoslug import AutoSlugField
from datetime import datetime
from .fields import CustomAjaxImageField

def concat_name_city(place):
    return "-".join((place.name, place.city))


class PlaceManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().prefetch_related('opening_hours')

    def only_visible(self):
        custom_list = [p.id for p in super(PlaceManager, self).get_queryset() if not p.is_temporarily_closed() and p.visible]
        #queryset = [p for p in queryset if not p.is_temporarily_closed() and p.visible]
        return super(PlaceManager, self).filter(id__in=custom_list)

class PlaceUserEditable(models.Model):
    name = models.CharField(max_length=50, blank=False)
    beer_price = models.PositiveSmallIntegerField(null=True, blank=True)
    beer_price_until = models.TimeField(blank=True, null=True)
    uteservering = models.NullBooleanField()

    class Meta:
        abstract = True

    def delete(*args, **kwargs):
        os.unlink(self.image.path)
        super(PlaceUserEditable, self).delete(*args, **kwargs)


class PlaceUserEdit(PlaceUserEditable):
    place = models.ForeignKey("Place", related_name="user_edits", on_delete=models.CASCADE)
    date_added = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True)
    user_comment = models.TextField(blank=True)
    image = CustomAjaxImageField(upload_to=settings.AJAXIMAGE['UPLOAD_DIR'], max_width=settings.AJAXIMAGE['MAX_WIDTH'], 
        max_height=settings.AJAXIMAGE['MAX_HEIGHT'], crop=int(settings.AJAXIMAGE['CROP']), null=True, blank=True)

    def __str__(self):
        return '%s, %s, %s' % (self.name, self.place.street_address, self.place.city,)


class Place(PlaceUserEditable):
    lat = models.DecimalField(decimal_places=7, max_digits=10)
    lng = models.DecimalField(decimal_places=7, max_digits=10)
    street_address = models.CharField(max_length=200)
    neighbourhood = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=50)
    date_published = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    visible = models.BooleanField(default=True)
    slug = AutoSlugField(unique=True, populate_from=concat_name_city)
    temporarily_closed_from = models.DateField(null=True, blank=True)
    temporarily_closed_until = models.DateField(null=True, blank=True)
    comment = models.TextField(blank=True)
    image = AjaxImageField(upload_to="place_images", max_width=1024, null=True, blank=True) 
    objects = PlaceManager()
    
    def __str__(self):
        return '%s, %s, %s' % (self.name, self.street_address, self.city,)

    def is_temporarily_closed(self):
        current_date = datetime.now().date() 
        if self.temporarily_closed_from == None and self.temporarily_closed_until == None:
            return False
        elif self.temporarily_closed_from == None and self.temporarily_closed_until >= current_date:
            return True
        elif self.temporarily_closed_from == None and self.temporarily_closed_until < current_date:
            return False
        elif self.temporarily_closed_from <= current_date and self.temporarily_closed_until == None:
            return True
        elif self.temporarily_closed_from <= current_date and self.temporarily_closed_until >= current_date:
            return True
        else:
            return False

    @property
    def open_now(self):
        """ Returnerar None om okänt. """
        now = datetime.now()
        current_weekday = now.weekday()
        if current_weekday == 0:
            weekday_yesterday = 6
        else:
            weekday_yesterday = current_weekday - 1
        current_time = now.time()
        ''' Loopa igenom platsens OpeningHours: '''
        for day in self.opening_hours.all():
            ''' Om det t.ex. är lördag kl. 01:00 och stängningstid för fredag är 02:00 -> öppet nu: '''
            try:
                if day.weekday == weekday_yesterday and day.closing_time < day.opening_time and current_time < day.closing_time:
                    return True
            except TypeError:
                pass
            if day.weekday == current_weekday:
                try:
                    if day.closing_time < day.opening_time and current_time >= day.opening_time:
                        return True
                    elif day.opening_time <= current_time < day.closing_time:
                        return True
                except TypeError:
                    pass
                return False 
        return None
    
    
class OpeningHoursAbstract(models.Model):
    weekday = models.PositiveSmallIntegerField(choices=WEEKDAYS.items(), default=0)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    closed_entire_day = models.BooleanField(default=False)

    class Meta:
        abstract = True
        ordering = ['weekday',]

    def save(self, *args, **kwargs):
        if self.opening_time == None or self.closing_time == None or self.closed_entire_day:
            self.opening_time = None
            self.closing_time = None
        if self.closed_entire_day or (self.opening_time is not None and self.closing_time is not None):
            # Spara bara raden om vi uttryckligen vet något om denna dag.
            return super(OpeningHoursAbstract, self).save(*args, **kwargs)


class OpeningHours(OpeningHoursAbstract):
    place = models.ForeignKey('Place', on_delete=models.CASCADE, related_name='opening_hours')

    def __str__(self):
        return '%s: %s' % (self.place.name, _(WEEKDAYS[self.weekday]),)


class OpeningHoursUserEdit(OpeningHoursAbstract):
    place_user_edit = models.ForeignKey('PlaceUserEdit', on_delete=models.CASCADE, related_name='opening_hours')

    def __str__(self):
        return '%s: %s' % (self.place_user_edit.place.name, _(WEEKDAYS[self.weekday]),)

