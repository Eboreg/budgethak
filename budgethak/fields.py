import os
from rest_framework import serializers
from ajaximage.fields import AjaxImageField

class CustomTimeField(serializers.TimeField):
    def get_value(self, dictionary):
        value = super().get_value(dictionary)
        if value == "":
            value = None
        return value

class CustomAjaxImageField(AjaxImageField):
    def pre_save(self, instance, add):
        # Flytta AJAX-uppladdad bild när hela PlaceUserEdit-modellen sparas, 
        # så att bilder från icke-sparade modeller kan raderas regelbundet
        image = getattr(instance, self.attname)
        if image.name != '':
            new_path = image.path.replace('user_uploads/', '')
            new_name = image.name.replace('user_uploads/', '')
            if new_path != image.path:
                try:
                    os.rename(image.path, new_path)
                    image.name = new_name
                except:
                    # Om flytt ej kunde genomföras, beror det antagligen på att
                    # filen redan flyttats (spara-knapp har tryckts flera gånger)
                    pass
        return super().pre_save(instance, add)
