# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Schedule.user_profile'
        db.delete_column(u'scheduler_schedule', 'user_profile_id')

        # Adding field 'Schedule.user_email'
        db.add_column(u'scheduler_schedule', 'user_email',
                      self.gf('django.db.models.fields.EmailField')(max_length=75, null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):

        # User chose to not deal with backwards NULL issues for 'Schedule.user_profile'
        raise RuntimeError("Cannot reverse this migration. 'Schedule.user_profile' and its values cannot be restored.")
        
        # The following code is provided here to aid in writing a correct migration        # Adding field 'Schedule.user_profile'
        db.add_column(u'scheduler_schedule', 'user_profile',
                      self.gf('django.db.models.fields.related.ForeignKey')(to=orm['account.BerkeleytimeUserProfile']),
                      keep_default=False)

        # Deleting field 'Schedule.user_email'
        db.delete_column(u'scheduler_schedule', 'user_email')


    models = {
        u'campus.building': {
            'Meta': {'object_name': 'Building'},
            'abbreviation': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'latitude': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'longitude': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'campus.room': {
            'Meta': {'object_name': 'Room'},
            'abbreviation': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'building': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['campus.Building']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'seats': ('django.db.models.fields.IntegerField', [], {'null': 'True'})
        },
        u'catalog.course': {
            'Meta': {'unique_together': "(('abbreviation', 'course_number'),)", 'object_name': 'Course'},
            'abbreviation': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'course_number': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'}),
            'credit_restrictions': ('django.db.models.fields.CharField', [], {'max_length': '1024', 'null': 'True', 'blank': 'True'}),
            'cs_course_id': ('django.db.models.fields.CharField', [], {'max_length': '1024', 'null': 'True', 'blank': 'True'}),
            'department': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'enrolled': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'enrolled_max': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'enrolled_percentage': ('django.db.models.fields.FloatField', [], {'default': '-1'}),
            'favorite_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'final_exam_status': ('django.db.models.fields.CharField', [], {'max_length': '1024', 'null': 'True', 'blank': 'True'}),
            'grade_average': ('django.db.models.fields.FloatField', [], {'default': '-1', 'null': 'True'}),
            'grading': ('django.db.models.fields.CharField', [], {'max_length': '1024', 'null': 'True', 'blank': 'True'}),
            'has_enrollment': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'hours': ('django.db.models.fields.CharField', [], {'max_length': '1024', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'letter_average': ('django.db.models.fields.CharField', [], {'max_length': '2', 'null': 'True', 'blank': 'True'}),
            'open_seats': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'prerequisites': ('django.db.models.fields.CharField', [], {'max_length': '1024', 'null': 'True', 'blank': 'True'}),
            'previously': ('django.db.models.fields.CharField', [], {'max_length': '1024', 'null': 'True', 'blank': 'True'}),
            'primary_kind': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '1024', 'null': 'True', 'blank': 'True'}),
            'units': ('django.db.models.fields.CharField', [], {'max_length': '1024', 'null': 'True', 'blank': 'True'}),
            'waitlisted': ('django.db.models.fields.IntegerField', [], {'default': '-1'})
        },
        u'catalog.section': {
            'Meta': {'object_name': 'Section'},
            'abbreviation': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'ccn': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'course': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['catalog.Course']"}),
            'course_number': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'course_title': ('django.db.models.fields.CharField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'days': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'disabled': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'end_time': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'enrolled': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'enrolled_max': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'final_day': ('django.db.models.fields.CharField', [], {'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'final_end': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'final_start': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'instructor': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'is_primary': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'kind': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'location_name': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'note': ('django.db.models.fields.TextField', [], {'null': 'True'}),
            'rank': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'related': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'related_rel_+'", 'null': 'True', 'to': u"orm['catalog.Section']"}),
            'restrictions': ('django.db.models.fields.TextField', [], {'null': 'True'}),
            'section_number': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'semester': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'standard_location': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['campus.Room']", 'null': 'True', 'on_delete': 'models.SET_NULL', 'blank': 'True'}),
            'start_time': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'suffix': ('django.db.models.fields.CharField', [], {'max_length': '5', 'null': 'True', 'blank': 'True'}),
            'textbooks': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['marketplace.Textbook']", 'symmetrical': 'False'}),
            'units': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'waitlisted': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'waitlisted_max': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'year': ('django.db.models.fields.CharField', [], {'max_length': '4', 'null': 'True', 'blank': 'True'})
        },
        u'marketplace.textbook': {
            'Meta': {'object_name': 'Textbook'},
            'amazon_affiliate_url': ('django.db.models.fields.URLField', [], {'max_length': '2000', 'null': 'True'}),
            'amazon_image_height': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'amazon_image_url': ('django.db.models.fields.URLField', [], {'max_length': '2000', 'null': 'True'}),
            'amazon_image_width': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'amazon_price': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '7', 'decimal_places': '2'}),
            'author': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True'}),
            'bookstore_price': ('django.db.models.fields.DecimalField', [], {'null': 'True', 'max_digits': '7', 'decimal_places': '2'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'edition': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_required': ('django.db.models.fields.BooleanField', [], {}),
            'isbn': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30', 'db_index': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'updated_at': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        },
        u'scheduler.schedule': {
            'Meta': {'object_name': 'Schedule'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_invalid': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'sections': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'section'", 'symmetrical': 'False', 'to': u"orm['catalog.Section']"}),
            'user_email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['scheduler']