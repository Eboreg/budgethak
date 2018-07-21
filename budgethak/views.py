# -*- coding: utf-8 -*-

import json
from ipware import get_client_ip
from django.shortcuts import get_object_or_404
from django.views.generic.base import TemplateView
from django.utils.translation import gettext as _
from rest_framework import viewsets, exceptions
from rest_framework.response import Response
from .serializers import PlaceSerializer, PlaceListSerializer, PlaceUserEditSerializer
from .models import Place, PlaceUserEdit

"""
REST-API.
Åtkomst via /api/places/.
Senare, när användare får föreslå ställen, kan jag ändra till ModelViewSet och
implementera create(), update(), partial_update() och destroy()
"""
class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.only_visible()
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == "retrieve":
            return PlaceSerializer
        elif self.action == "list":
            return PlaceListSerializer
        elif self.action == "update":
            return PlaceUserEditSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        place = self.queryset.get(slug=kwargs.pop("slug"))
        instance = PlaceUserEdit(place=place, ip_address=get_client_ip(request)[0])
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            errors = serializer.errors.copy()
            try:
                for idx in range(0, len(errors['opening_hours'])):
                    for key, value in errors['opening_hours'][idx].items():
                        errors[key+'-'+str(idx)] = value
            except:
                pass
            return Response(data=errors, status=400)
        elif serializer.has_changed():
            self.perform_update(serializer)
            return Response(serializer.data)
        else:
            return Response(serializer.initial_data)


"""
Langar upp templates/index.html med lämplig context.
"""
class IndexView(TemplateView):
    template_name = 'index.html'
    queryset = Place.objects.only_visible()
    
    """
    Hämtar samma lista som PlaceViewSet.list(), men som JSON, så att vi kan bootstrappa in den i Backbone
    """
    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        serializer = PlaceListSerializer(self.queryset, many=True)
        context['places'] = json.dumps(serializer.data, separators=(',', ':', ))
        return context
    
