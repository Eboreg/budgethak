# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-07-19 20:24
from __future__ import unicode_literals

import autoslug.fields
from django.db import migrations, models
import places.models


class Migration(migrations.Migration):

    dependencies = [
        ('places', '0011_auto_20160707_0205'),
    ]

    operations = [
        migrations.AddField(
            model_name='openinghours',
            name='closed_entire_day',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='openinghours',
            name='closing_time',
            field=models.TimeField(null=True),
        ),
        migrations.AlterField(
            model_name='openinghours',
            name='opening_time',
            field=models.TimeField(null=True),
        ),
        migrations.AlterField(
            model_name='place',
            name='slug',
            field=autoslug.fields.AutoSlugField(editable=False, populate_from=places.models.concat_name_city, unique=True),
        ),
    ]
