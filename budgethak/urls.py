"""budgethak URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.conf.urls.static import static
from django.conf import settings
from django.contrib import admin
from django.views.generic import TemplateView
from rest_framework import routers
from .views import IndexView, PlaceViewSet

router = routers.DefaultRouter()
router.register(r'^api/places', PlaceViewSet)

urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += [
    url(r'^tests$', TemplateView.as_view(template_name='index.html')),
    url(r'^admin/', admin.site.urls),
    url(r'^ajaximage/', include('ajaximage.urls')),
    url(r'^place/(?P<id>.*)', IndexView.as_view(), name="place"),
    url(r'^info$', IndexView.as_view(), name="info"),
    url(r'^$', IndexView.as_view(), name="index"),
]
urlpatterns += router.urls
'''
if settings.DEBUG:
    urlpatterns += patterns('django.contrib.staticfiles.views', url(r'^(?P<path>.*)$', 'serve'))
'''
