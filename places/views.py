# -*- coding: utf-8 -*-

#from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from .serializers import PlaceSerializer, PlaceListSerializer
from .models import Place
from django.shortcuts import get_object_or_404
from django.views.generic.base import TemplateView


"""
Åtkomst via /api/places/.
Senare, när användare får föreslå ställen, kan jag ändra till ModelViewSet och
implementera create(), update(), partial_update() och destroy()
"""
class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    
    def list(self, request, *args, **kwargs):
        queryset = Place.objects.all()
        # Filtrera bort platser som är tillfälligt stängda just nu eller har visible == False:
        queryset = [p for p in queryset if not p.is_temporarily_closed() and p.visible]
        serializer = PlaceListSerializer(queryset, many=True)
        return Response(serializer.data)
        
    def retrieve(self, request, pk=None):
        queryset = Place.objects.all()
        place = get_object_or_404(queryset, pk=pk)
        serializer = PlaceSerializer(place)
        return Response(serializer.data)
    
    
class IndexView(TemplateView):
    template_name = 'index.html'
