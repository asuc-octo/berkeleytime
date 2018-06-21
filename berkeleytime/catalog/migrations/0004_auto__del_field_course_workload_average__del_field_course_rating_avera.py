# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Course.workload_average'
        db.delete_column('catalog_course', 'workload_average')

        # Deleting field 'Course.rating_average'
        db.delete_column('catalog_course', 'rating_average')


    def backwards(self, orm):
        # Adding field 'Course.workload_average'
        db.add_column('catalog_course', 'workload_average',
                      self.gf('django.db.models.fields.FloatField')(default=-1),
                      keep_default=False)

        # Adding field 'Course.rating_average'
        db.add_column('catalog_course', 'rating_average',
                      self.gf('django.db.models.fields.FloatField')(default=-1),
                      keep_default=False)


    models = {
        'account.berkeleytimeuserprofile': {
            'Meta': {'object_name': 'BerkeleytimeUserProfile'},
            'about_me': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'access_token': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'blog_url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'date_of_birth': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'facebook_id': ('django.db.models.fields.BigIntegerField', [], {'unique': 'True', 'null': 'True', 'blank': 'True'}),
            'facebook_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'facebook_open_graph': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'facebook_profile_url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'gender': ('django.db.models.fields.CharField', [], {'max_length': '1', 'null': 'True', 'blank': 'True'}),
            'grad_year': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'image': ('django.db.models.fields.files.ImageField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'major': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['catalog.Major']", 'symmetrical': 'False'}),
            'phase1': ('django.db.models.fields.DateTimeField', [], {'null': 'True'}),
            'phase2': ('django.db.models.fields.DateTimeField', [], {'null': 'True'}),
            'raw_data': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['auth.User']", 'unique': 'True'}),
            'website_url': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'})
        },
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
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
        },
        'catalog.course': {
            'Meta': {'object_name': 'Course'},
            'abbreviation': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '20'}),
            'al': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'american_cultures': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'american_history': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'american_institutions': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'bs': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'chemistry': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'college_writing': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'course_integer': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'course_number': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '10'}),
            'credit_option': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '400'}),
            'department': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '150'}),
            'description': ('django.db.models.fields.TextField', [], {'default': "''"}),
            'engineering': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'fall': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'format': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '350'}),
            'grade_average': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'grading_option': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '400'}),
            'haas_al': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'haas_bs': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'haas_hs': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'haas_ins': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'haas_ps': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'haas_pv': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'haas_sbs': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'hs': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ins': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'default': "''", 'auto_now': 'True', 'blank': 'True'}),
            'latest_enrolled': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'latest_enrolled_max': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'latest_enrolled_percentage': ('django.db.models.fields.FloatField', [], {'default': '-1'}),
            'latest_open_seats': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'latest_waitlisted': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'letter_average': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '2'}),
            'level': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '80'}),
            'nbqr': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'prerequisites': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '400'}),
            'previously': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '300'}),
            'primary_kind': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '20'}),
            'ps': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'pv': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'reading_a': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'reading_b': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'sbs': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'spring': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'standard_department': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'time': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '300'}),
            'title': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '150'}),
            'units': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '500'})
        },
        'catalog.enrollment': {
            'Meta': {'object_name': 'Enrollment'},
            'ccn': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'date_created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2013, 6, 16, 0, 0)'}),
            'enrolled': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'enrolled_max': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'live': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'manual_waitlist': ('django.db.models.fields.NullBooleanField', [], {'null': 'True', 'blank': 'True'}),
            'no_waitlist': ('django.db.models.fields.NullBooleanField', [], {'null': 'True', 'blank': 'True'}),
            'section': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['catalog.Section']"}),
            'semester': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'waitlisted': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'waitlisted_max': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'year': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '4'})
        },
        'catalog.grade': {
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
            'course': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['catalog.Course']"}),
            'course_number': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'd1': ('django.db.models.fields.IntegerField', [], {}),
            'd2': ('django.db.models.fields.IntegerField', [], {}),
            'd3': ('django.db.models.fields.IntegerField', [], {}),
            'department': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'f': ('django.db.models.fields.IntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
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
        'catalog.major': {
            'Meta': {'object_name': 'Major'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'catalog.playlist': {
            'Meta': {'object_name': 'Playlist'},
            'category': ('django.db.models.fields.CharField', [], {'default': "'custom'", 'max_length': '255'}),
            'courses': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['catalog.Course']", 'symmetrical': 'False'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['account.BerkeleytimeUserProfile']", 'null': 'True'})
        },
        'catalog.section': {
            'Meta': {'object_name': 'Section'},
            'abbreviation': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '20'}),
            'ccn': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'course': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['catalog.Course']"}),
            'course_number': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '20'}),
            'course_title': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '200'}),
            'days': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '20'}),
            'disabled': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'end_time': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'enrolled': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'enrolled_max': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'final_end': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'final_start': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'instructor': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '300'}),
            'kind': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '100'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'location': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '300'}),
            'note': ('django.db.models.fields.TextField', [], {'null': 'True'}),
            'rank': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'related': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'related_rel_+'", 'null': 'True', 'to': "orm['catalog.Section']"}),
            'restrictions': ('django.db.models.fields.TextField', [], {'null': 'True'}),
            'section_number': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '20'}),
            'semester': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '20'}),
            'standard_location': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['campus.Classroom']", 'null': 'True'}),
            'start_time': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'suffix': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '5'}),
            'units': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'waitlisted': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'year': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '4'})
        },
        'catalog.tip': {
            'Meta': {'object_name': 'Tip'},
            'comment': ('django.db.models.fields.TextField', [], {'default': "''"}),
            'course': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['catalog.Course']"}),
            'date_created': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'instructor': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '300'}),
            'rating': ('django.db.models.fields.IntegerField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['account.BerkeleytimeUserProfile']"}),
            'workload': ('django.db.models.fields.IntegerField', [], {})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['catalog']