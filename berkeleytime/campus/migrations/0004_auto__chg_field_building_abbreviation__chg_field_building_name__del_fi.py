# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'Building.abbreviation'
        db.alter_column('campus_building', 'abbreviation', self.gf('django.db.models.fields.CharField')(max_length=100, null=True))

        # Changing field 'Building.name'
        db.alter_column('campus_building', 'name', self.gf('django.db.models.fields.CharField')(max_length=200, null=True))
        # Deleting field 'Room.room_name'
        db.delete_column('campus_room', 'room_name')

        # Adding field 'Room.abbreviation'
        db.add_column('campus_room', 'abbreviation',
                      self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):

        # Changing field 'Building.abbreviation'
        db.alter_column('campus_building', 'abbreviation', self.gf('django.db.models.fields.CharField')(max_length=100))

        # Changing field 'Building.name'
        db.alter_column('campus_building', 'name', self.gf('django.db.models.fields.CharField')(max_length=200))
        # Adding field 'Room.room_name'
        db.add_column('campus_room', 'room_name',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=200, null=True, blank=True),
                      keep_default=False)

        # Deleting field 'Room.abbreviation'
        db.delete_column('campus_room', 'abbreviation')


    models = {
        'campus.building': {
            'Meta': {'object_name': 'Building'},
            'abbreviation': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'latitude': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'longitude': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        'campus.room': {
            'Meta': {'object_name': 'Room'},
            'abbreviation': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'building': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['campus.Building']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'seats': ('django.db.models.fields.IntegerField', [], {'null': 'True'})
        }
    }

    complete_apps = ['campus']