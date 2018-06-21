# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Textbook.amazon_price'
        db.add_column(u'marketplace_textbook', 'amazon_price',
                      self.gf('django.db.models.fields.DecimalField')(default=0.0, max_digits=7, decimal_places=2),
                      keep_default=False)


        # Changing field 'Textbook.isbn'
        db.alter_column(u'marketplace_textbook', 'isbn', self.gf('django.db.models.fields.CharField')(default='0', unique=True, max_length=30))

    def backwards(self, orm):
        # Deleting field 'Textbook.amazon_price'
        db.delete_column(u'marketplace_textbook', 'amazon_price')


        # Changing field 'Textbook.isbn'
        db.alter_column(u'marketplace_textbook', 'isbn', self.gf('django.db.models.fields.CharField')(unique=True, max_length=30, null=True))

    models = {
        u'marketplace.textbook': {
            'Meta': {'object_name': 'Textbook'},
            'amazon_price': ('django.db.models.fields.DecimalField', [], {'max_digits': '7', 'decimal_places': '2'}),
            'author': ('django.db.models.fields.CharField', [], {'max_length': '80', 'null': 'True'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'edition': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_required': ('django.db.models.fields.BooleanField', [], {}),
            'isbn': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30', 'db_index': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'updated_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['marketplace']