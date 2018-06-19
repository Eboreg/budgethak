# -*- coding: utf-8 -*-

#from django.shortcuts import render
import json
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from .serializers import PlaceSerializer, PlaceListSerializer
from .models import Place
from django.shortcuts import get_object_or_404
from django.views.generic.base import TemplateView

"""
REST-API.
Åtkomst via /api/places/.
Senare, när användare får föreslå ställen, kan jag ändra till ModelViewSet och
implementera create(), update(), partial_update() och destroy()
"""
class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.only_visible()
    
    def list(self, request, *args, **kwargs):
        serializer = PlaceListSerializer(self.queryset, many=True)
        return Response(serializer.data)
        
    def retrieve(self, request, pk=None):
        place = get_object_or_404(self.queryset, slug=pk)
        serializer = PlaceSerializer(place)
        return Response(serializer.data)
    

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
#        context['places'] = JSONRenderer().render(serializer.data) 
        context['places'] = json.dumps(serializer.data, separators=(',', ':', ))
        return context
    
