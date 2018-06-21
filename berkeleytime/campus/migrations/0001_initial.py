# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Place'
        db.create_table('campus_place', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(default='', max_length=200)),
            ('abbreviation', self.gf('django.db.models.fields.CharField')(default='', max_length=100)),
            ('latitude', self.gf('django.db.models.fields.FloatField')(null=True)),
            ('longitude', self.gf('django.db.models.fields.FloatField')(null=True)),
        ))
        db.send_create_signal('campus', ['Place'])

        # Adding model 'Classroom'
        db.create_table('campus_classroom', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('place', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['campus.Place'])),
            ('room_number', self.gf('django.db.models.fields.CharField')(default='', max_length=100, null=True)),
            ('seats', self.gf('django.db.models.fields.IntegerField')(null=True)),
        ))
        db.send_create_signal('campus', ['Classroom'])


    def backwards(self, orm):
        # Deleting model 'Place'
        db.delete_table('campus_place')

        # Deleting model 'Classroom'
        db.delete_table('campus_classroom')


    models = {
        'campus.classroom': {
            'Meta': {'object_name': 'Classroom'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'place': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['campus.Place']"}),
            'room_number': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '100', 'null': 'True'}),
            'seats': ('django.db.models.fields.IntegerField', [], {'null': 'True'})
        },
        'campus.place': {
            'Meta': {'object_name': 'Place'},
            'abbreviation': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'latitude': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'longitude': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'})
        }
    }

    complete_apps = ['campus']