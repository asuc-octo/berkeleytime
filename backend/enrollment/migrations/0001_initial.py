# Generated by Django 3.1.1 on 2020-10-17 16:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('catalog', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Enrollment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('enrolled', models.IntegerField(null=True)),
                ('enrolled_max', models.IntegerField(null=True)),
                ('waitlisted', models.IntegerField(null=True)),
                ('waitlisted_max', models.IntegerField(null=True)),
                ('section', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='catalog.section')),
            ],
            options={
                'db_table': 'enrollment',
                'unique_together': {('section', 'date_created')},
            },
        ),
    ]
