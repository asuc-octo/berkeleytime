# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting model 'Classroom'
        db.delete_table('campus_classroom')

        # Deleting model 'Place'
        db.delete_table('campus_place')


    def backwards(self, orm):
        # Adding model 'Classroom'
        db.create_table('campus_classroom', (
            ('room_number', self.gf('django.db.models.fields.CharField')(default='', max_length=100, null=True)),
            ('place', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['campus.Place'])),
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('seats', self.gf('django.db.models.fields.IntegerField')(null=True)),
        ))
        db.send_create_signal('campus', ['Classroom'])

        # Adding model 'Place'
        db.create_table('campus_place', (
            ('name', self.gf('django.db.models.fields.CharField')(default='', max_length=200)),
            ('longitude', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('abbreviation', self.gf('django.db.models.fields.CharField')(default='', max_length=100)),
            ('latitude', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
        ))
        db.send_create_signal('campus', ['Place'])


    models = {
        
    }

    complete_apps = ['campus']