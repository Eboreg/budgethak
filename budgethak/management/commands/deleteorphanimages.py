import os
from django.conf import settings
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Raderar användaruppladdade bilder som inte är knutna till någon modell'
    path = os.path.join(settings.MEDIA_ROOT, settings.AJAXIMAGE['UPLOAD_DIR'])

    def handle(self, *args, **options):
        for image in os.scandir(self.path):
            if image.is_file():
                try:
                    os.unlink(image.path)
                except Exception as e:
                    self.stderr.write(str(e))
                else:
                    self.stdout.write("Raderade %s" % (image.name,))
