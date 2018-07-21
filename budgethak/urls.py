from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.contrib import admin
from django.views.generic import TemplateView
from rest_framework import routers
from .views import IndexView, PlaceViewSet, TestView

router = routers.SimpleRouter()
router.register('api/places', PlaceViewSet)

urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += router.urls
urlpatterns += [
    path('test/', TestView.as_view()),
    path('admin/', admin.site.urls),
    path('ajaximage/', include('ajaximage.urls')),
    path('place/<slug:id>/', IndexView.as_view(), name="place"),
    path('info/', IndexView.as_view(), name="info"),
    path('', IndexView.as_view(), name="index"),
]
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
'''
if settings.DEBUG:
    urlpatterns += patterns('django.contrib.staticfiles.views', url(r'^(?P<path>.*)$', 'serve'))
'''
