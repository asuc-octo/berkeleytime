# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Section.final_day'
        db.add_column(u'catalog_section', 'final_day',
                      self.gf('django.db.models.fields.CharField')(max_length=1, null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Section.final_day'
        db.delete_column(u'catalog_section', 'final_day')


    models = {
        u'account.berkeleytimeuserprofile': {
            'Meta': {'object_name': 'BerkeleytimeUserProfile'},
            'about_me': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'access_token': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'blog_url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'date_of_birth': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'facebook_id': ('django.db.models.fields.BigIntegerField', [], {'unique': 'True', 'null': 'True', 'blank': 'True'}),
            'facebook_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'facebook_open_graph': ('django.db.models.fields.NullBooleanField', [], {'null': 'True', 'blank': 'True'}),
            'facebook_profile_url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'gender': ('django.db.models.fields.CharField', [], {'max_length': '1', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.files.ImageField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'is_legacy': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'new_token_required': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'raw_data': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['auth.User']", 'unique': 'True'}),
            'website_url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        },
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
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
        u'catalog.enrollment': {
            'Meta': {'unique_together': "(('section', 'date_created'),)", 'object_name': 'Enrollment'},
            'date_created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2016, 10, 12, 0, 0)'}),
            'enrolled': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'enrolled_max': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'section': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['catalog.Section']"}),
            'waitlisted': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'waitlisted_max': ('django.db.models.fields.IntegerField', [], {'null': 'True'})
        },
        u'catalog.grade': {
            'Meta': {'object_name': 'Grade'},
            'a1': ('django.db.models.fields.IntegerField', [], {}),
            'a2': ('django.db.models.fields.IntegerField', [], {}),
            'a3': ('django.db.models.fields.IntegerField', [], {}),
            'abbreviation': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'average': ('django.db.models.fields.FloatField', [], {}),
            'b1': ('django.db.models.fields.IntegerField', [], {}),
            'b2': ('django.db.models.fields.IntegerField', [], {}),
            'b3': ('django.db.models.fields.IntegerField', [], {}),
            'c1': ('django.db.models.fields.IntegerField', [], {}),
            'c2': ('django.db.models.fields.IntegerField', [], {}),
            'c3': ('django.db.models.fields.IntegerField', [], {}),
            'course': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['catalog.Course']"}),
            'course_number': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'd1': ('django.db.models.fields.IntegerField', [], {}),
            'd2': ('django.db.models.fields.IntegerField', [], {}),
            'd3': ('django.db.models.fields.IntegerField', [], {}),
            'department': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'f': ('django.db.models.fields.IntegerField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'incomplete': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'instructor': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'letter_average': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '2'}),
            'np': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'p': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'section_number': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'semester': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'total': ('django.db.models.fields.IntegerField', [], {}),
            'year': ('django.db.models.fields.CharField', [], {'max_length': '4'})
        },
        u'catalog.playlist': {
            'Meta': {'object_name': 'Playlist'},
            'category': ('django.db.models.fields.CharField', [], {'default': "'custom'", 'max_length': '255'}),
            'courses': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['catalog.Course']", 'symmetrical': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['account.BerkeleytimeUserProfile']", 'null': 'True'})
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
            'units': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'waitlisted': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'waitlisted_max': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'year': ('django.db.models.fields.CharField', [], {'max_length': '4', 'null': 'True', 'blank': 'True'})
        },
        u'catalog.updatelog': {
            'Meta': {'object_name': 'UpdateLog'},
            'date_created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'finished': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'message': ('django.db.models.fields.CharField', [], {'max_length': '1024', 'null': 'True', 'blank': 'True'}),
            'semester': ('django.db.models.fields.CharField', [], {'default': "'spring'", 'max_length': '50'}),
            'started': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'year': ('django.db.models.fields.CharField', [], {'default': "'2017'", 'max_length': '4'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['catalog']