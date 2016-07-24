from django.test import TestCase
from .models import Place, OpeningHours

class OpeningHoursTests(TestCase):
    def test_start_weekday_larger_than_end_weekday(self):
        oh = OpeningHours.objects.create(start_weekday=1, end_weekday=0, opening_time='12:00', closing_time='20:00', place_id=1)
        oh.save()
        self.assertEqual(oh.end_weekday, 1)

    def test_opening_hours_none_sets_closed_entire_day(self):
        oh = OpeningHours.objects.create(start_weekday=1, end_weekday=0, opening_time=None, closing_time=None, place_id=1)
        oh.save()
        self.assertEqual(oh.closed_entire_day, True)
        

class PlaceTests(TestCase):
    def create_test_place(self):
        return Place(name="name", lat=0, lng=0, street_address="street_address", city="city", uteservering=True)
    
    def test_auto_generate_slug(self):
        place = self.create_test_place()
        place.save()
        self.assertNotEqual(place.slug, '')