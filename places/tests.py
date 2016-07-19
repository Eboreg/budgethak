from django.test import TestCase
from .models import Place, OpeningHours

class OpeningHoursTests(TestCase):
    def test_start_weekday_larger_than_end_weekday(self):
        oh = OpeningHours.objects.create(start_weekday=1, end_weekday=0, opening_time='12:00', closing_time='20:00', place_id=1)
        self.assertEqual(oh.end_weekday, 1)
        

class PlaceTests(TestCase):
    def create_test_place(self):
        return Place(name="name", lat=0, lng=0, street_address="street_address", city="city", uteservering=True)
    
