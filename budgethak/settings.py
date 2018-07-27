import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
# Blir t.ex. '/home/klaatu/kod/Aptana/budgethak'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HOSTNAME = 'http://127.0.0.1:8000'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.9/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '+3q)ip^=k#q+5+-gib#&=l@$$7&fv24a*el$fh8ve^y0621i9v'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['huseli.us', '127.0.0.1', 'localhost', 'budgethak.se', 'www.budgethak.se', ]
INTERNAL_IPS = ['127.0.0.1', 'localhost',]

# Email settings
ADMINS = [('Robert Huselius', 'robert@huseli.us')]
DEFAULT_FROM_EMAIL = 'robert@huseli.us'
SERVER_EMAIL = DEFAULT_FROM_EMAIL
EMAIL_HOST = 'mail.huseli.us'
EMAIL_HOST_USER = 'robert@huseli.us'
from .settings_private import EMAIL_HOST_PASSWORD
EMAIL_USE_TLS = True
TEMPLATED_EMAIL_FILE_EXTENSION = 'html'

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'budgethak',
    'ajaximage',
    'debug_toolbar',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    #'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

ROOT_URLCONF = 'budgethak.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.static',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'budgethak.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases
DATABASES = {
    'default' : {
                 'ENGINE' : 'django.db.backends.sqlite3',
                 'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    },
}
"""
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'budgethak',
        'USER' : 'budgethak',
        'PASSWORD' : 'tSYl0yokdBI6U9tdFGeU',
        'HOST' : 'localhost',
    }
"""


# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.9/topics/i18n/
LANGUAGE_CODE = 'sv'
TIME_ZONE = 'Europe/Stockholm'
USE_I18N = True
USE_L10N = True
USE_TZ = True
LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale')
]


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/
STATICFILES_DIRS = (
                    ('lib', os.path.join(BASE_DIR, 'lib')),
                    )
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# GEOS/GDAL settings
if os.sys.platform == "win32":
    GEOS_LIBRARY_PATH = 'C:\\Program Files (x86)\\GDAL\\geos_c.dll'
    GDAL_LIBRARY_PATH = 'C:\\Program Files (x86)\\GDAL\\gdal203.dll'


# REST Framework settings
REST_FRAMEWORK = {
    'TIME_FORMAT' : '%H:%M',
    'TIME_INPUT_FORMATS' : ['%H:%M',],
}


# Ajaximage settings
AJAXIMAGE_DIR = ''
AJAXIMAGE_AUTH_TEST = lambda u: True
AJAXIMAGE = {
    'UPLOAD_DIR' : 'place_images/user_uploads',
    'MAX_WIDTH' : 1024,
    'MAX_HEIGHT' : 576,
    'CROP' : True,
}
