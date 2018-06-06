from django.conf.urls import url

from .views import ajaximage

urlpatterns = [
    url(
        '^upload/(?P<upload_to>.*)/(?P<max_width>\d+)/(?P<max_height>\d+)/(?P<crop>\d+)', ajaximage, name='ajaximage'
    ),
]
