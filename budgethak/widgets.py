from django.template.loader import get_template

from ajaximage.widgets import AjaxImageWidget

class UserImageWidget(AjaxImageWidget):
    template_name = 'budgethak/widgets/user_image.html'
    
    def __init__(self, *args, **kwargs):
        self.html = get_template(self.template_name).render()
        return super().__init__(*args, **kwargs)
    