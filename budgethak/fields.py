from rest_framework import serializers

class CustomTimeField(serializers.TimeField):
    def get_value(self, dictionary):
        value = super().get_value(dictionary)
        if value == "":
            value = None
        return value
