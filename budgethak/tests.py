from django.test import TestCase
from .models import Place, OpeningHours
from datetime import datetime, timedelta

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

    def create_test_place_temporarily_closed(self, closed_from, closed_until):
        place = self.create_test_place()
        place.temporarily_closed_from = closed_from
        place.temporarily_closed_until = closed_until
        place.save()
        return place
    
    def test_auto_generate_slug(self):
        place = self.create_test_place()
        place.save()
        self.assertNotEqual(place.slug, '')
        
    def test_temporarily_closed_past_date_to_past_date(self):
        past1 = datetime.now().date() - timedelta(60)
        past2 = datetime.now().date() - timedelta(30)
        place = self.create_test_place_temporarily_closed(past1, past2)
        self.assertEqual(place.is_temporarily_closed(), False)

    def test_temporarily_closed_from_past_date_to_today(self):
        past = datetime.now().date() - timedelta(30)
        today = datetime.now().date()
        place = self.create_test_place_temporarily_closed(past, today)
        self.assertEqual(place.is_temporarily_closed(), True)

    def test_temporarily_closed_from_past_date_to_future_date(self):
        past = datetime.now().date() - timedelta(30)
        future = datetime.now().date() + timedelta(30)
        place = self.create_test_place_temporarily_closed(past, future)
        self.assertEqual(place.is_temporarily_closed(), True)

    def test_temporarily_closed_from_past_date_to_none(self):
        past = datetime.now().date() - timedelta(30)
        place = self.create_test_place_temporarily_closed(past, None)
        self.assertEqual(place.is_temporarily_closed(), True)

    def test_temporarily_closed_from_today_to_today(self):
        today = datetime.now().date()
        place = self.create_test_place_temporarily_closed(today, today)
        self.assertEqual(place.is_temporarily_closed(), True)

    def test_temporarily_closed_from_today_to_future_date(self):
        today = datetime.now().date()
        future = datetime.now().date() + timedelta(30)
        place = self.create_test_place_temporarily_closed(today, future)
        self.assertEqual(place.is_temporarily_closed(), True)

    def test_temporarily_closed_from_today_to_none(self):
        today = datetime.now().date()
        place = self.create_test_place_temporarily_closed(today, None)
        self.assertEqual(place.is_temporarily_closed(), True)

    def test_temporarily_closed_from_future_date_to_future_date(self):
        future1 = datetime.now().date() + timedelta(30)
        future2 = datetime.now().date() + timedelta(60)
        place = self.create_test_place_temporarily_closed(future1, future2)
        self.assertEqual(place.is_temporarily_closed(), False)

    def test_temporarily_closed_from_future_date_to_none(self):
        future = datetime.now().date() + timedelta(30)
        place = self.create_test_place_temporarily_closed(future, None)
        self.assertEqual(place.is_temporarily_closed(), False)

    def test_temporarily_closed_from_none_to_past_date(self):
        past = datetime.now().date() - timedelta(30)
        place = self.create_test_place_temporarily_closed(None, past)
        self.assertEqual(place.is_temporarily_closed(), False)

    def test_temporarily_closed_from_none_to_today(self):
        today = datetime.now().date()
        place = self.create_test_place_temporarily_closed(None, today)
        self.assertEqual(place.is_temporarily_closed(), True)

    def test_temporarily_closed_from_none_to_future_date(self):
        future = datetime.now().date() + timedelta(30)
        place = self.create_test_place_temporarily_closed(None, future)
        self.assertEqual(place.is_temporarily_closed(), True)

        