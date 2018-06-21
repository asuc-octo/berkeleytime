# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Textbook'
        db.create_table(u'marketplace_textbook', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('updated_at', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=500)),
            ('author', self.gf('django.db.models.fields.CharField')(max_length=80, null=True)),
            ('edition', self.gf('django.db.models.fields.CharField')(max_length=100, null=True)),
            ('isbn', self.gf('django.db.models.fields.CharField')(max_length=30, unique=True, null=True)),
        ))
        db.send_create_signal(u'marketplace', ['Textbook'])


    def backwards(self, orm):
        # Deleting model 'Textbook'
        db.delete_table(u'marketplace_textbook')


    models = {
        u'marketplace.textbook': {
            'Meta': {'object_name': 'Textbook'},
            'author': ('django.db.models.fields.CharField', [], {'max_length': '80', 'null': 'True'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'edition': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'isbn': ('django.db.models.fields.CharField', [], {'max_length': '30', 'unique': 'True', 'null': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'updated_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['marketplace']