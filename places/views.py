# -*- coding: utf-8 -*-

#from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from .serializers import PlaceSerializer, PlaceListSerializer
from .models import Place
from django.shortcuts import get_object_or_404
from django.views.generic.base import TemplateView


"""
Åtkomst via /api/.
Senare, när användare får föreslå ställen, kan jag ändra till ModelViewSet och
implementera create(), update(), partial_update() och destroy()
"""
class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all()
    
    def list(self, request, *args, **kwargs):
        """ GET-variabler: nw = "nordvästlatitud,nordvästlongitud", so = "sydostlatitud,sydostlongitud" """  
        queryset = []
        try:
            nw = request.GET.get('nw').split(',')
            so = request.GET.get('so').split(',')
            queryset = Place.objects.filter(
                                            lat__gte=float(nw[0]),
                                            lng__gte=float(nw[1]),
                                            lat__lte=float(so[0]),
                                            lng__lte=float(so[1]),
                                            )
            # Filtrera bort platser som är tillfälligt stängda just nu:
            queryset = [p for p in queryset if not p.is_temporarily_closed()]
        except (IndexError, ValueError, AttributeError):
            pass
        serializer = PlaceListSerializer(queryset, many=True)
        return Response(serializer.data)
        
    def retrieve(self, request, pk=None):
        queryset = Place.objects.all()
        place = get_object_or_404(queryset, pk=pk)
        serializer = PlaceSerializer(place)
        return Response(serializer.data)
    
    
class IndexView(TemplateView):
    template_name = 'index.html'
