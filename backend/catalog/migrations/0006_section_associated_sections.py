# Generated by Django 3.1.1 on 2021-02-21 22:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0005_course_cross_listing'),
    ]

    operations = [
        migrations.AddField(
            model_name='section',
            name='associated_sections',
            field=models.ManyToManyField(related_name='_section_associated_sections_+', to='catalog.Section'),
        ),
    ]
