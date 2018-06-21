# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Course.american_cultures'
        db.delete_column(u'catalog_course', 'american_cultures')

        # Deleting field 'Course.standard_department'
        db.delete_column(u'catalog_course', 'standard_department')

        # Deleting field 'Course.american_institutions'
        db.delete_column(u'catalog_course', 'american_institutions')

        # Deleting field 'Course.course_integer'
        db.delete_column(u'catalog_course', 'course_integer')

        # Deleting field 'Course.grading_option'
        db.delete_column(u'catalog_course', 'grading_option')

        # Deleting field 'Course.ps'
        db.delete_column(u'catalog_course', 'ps')

        # Deleting field 'Course.pv'
        db.delete_column(u'catalog_course', 'pv')

        # Deleting field 'Course.haas_bs'
        db.delete_column(u'catalog_course', 'haas_bs')

        # Deleting field 'Course.format'
        db.delete_column(u'catalog_course', 'format')

        # Deleting field 'Course.hs'
        db.delete_column(u'catalog_course', 'hs')

        # Deleting field 'Course.fall'
        db.delete_column(u'catalog_course', 'fall')

        # Deleting field 'Course.american_history'
        db.delete_column(u'catalog_course', 'american_history')

        # Deleting field 'Course.level'
        db.delete_column(u'catalog_course', 'level')

        # Deleting field 'Course.reading_a'
        db.delete_column(u'catalog_course', 'reading_a')

        # Deleting field 'Course.reading_b'
        db.delete_column(u'catalog_course', 'reading_b')

        # Deleting field 'Course.haas_al'
        db.delete_column(u'catalog_course', 'haas_al')

        # Deleting field 'Course.haas_pv'
        db.delete_column(u'catalog_course', 'haas_pv')

        # Deleting field 'Course.haas_ps'
        db.delete_column(u'catalog_course', 'haas_ps')

        # Deleting field 'Course.sbs'
        db.delete_column(u'catalog_course', 'sbs')

        # Deleting field 'Course.spring'
        db.delete_column(u'catalog_course', 'spring')

        # Deleting field 'Course.credit_option'
        db.delete_column(u'catalog_course', 'credit_option')

        # Deleting field 'Course.al'
        db.delete_column(u'catalog_course', 'al')

        # Deleting field 'Course.ins'
        db.delete_column(u'catalog_course', 'ins')

        # Deleting field 'Course.engineering'
        db.delete_column(u'catalog_course', 'engineering')

        # Deleting field 'Course.haas_sbs'
        db.delete_column(u'catalog_course', 'haas_sbs')

        # Deleting field 'Course.nbqr'
        db.delete_column(u'catalog_course', 'nbqr')

        # Deleting field 'Course.haas_hs'
        db.delete_column(u'catalog_course', 'haas_hs')

        # Deleting field 'Course.college_writing'
        db.delete_column(u'catalog_course', 'college_writing')

        # Deleting field 'Course.time'
        db.delete_column(u'catalog_course', 'time')

        # Deleting field 'Course.bs'
        db.delete_column(u'catalog_course', 'bs')

        # Deleting field 'Course.chemistry'
        db.delete_column(u'catalog_course', 'chemistry')

        # Deleting field 'Course.haas_ins'
        db.delete_column(u'catalog_course', 'haas_ins')

        # Adding field 'Course.hours'
        db.add_column(u'catalog_course', 'hours',
                      self.gf('django.db.models.fields.CharField')(max_length=350, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Course.grading'
        db.add_column(u'catalog_course', 'grading',
                      self.gf('django.db.models.fields.CharField')(max_length=400, null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'Course.american_cultures'
        db.add_column(u'catalog_course', 'american_cultures',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.standard_department'
        db.add_column(u'catalog_course', 'standard_department',
                      self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Course.american_institutions'
        db.add_column(u'catalog_course', 'american_institutions',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.course_integer'
        db.add_column(u'catalog_course', 'course_integer',
                      self.gf('django.db.models.fields.IntegerField')(null=True),
                      keep_default=False)

        # Adding field 'Course.grading_option'
        db.add_column(u'catalog_course', 'grading_option',
                      self.gf('django.db.models.fields.CharField')(max_length=400, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Course.ps'
        db.add_column(u'catalog_course', 'ps',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.pv'
        db.add_column(u'catalog_course', 'pv',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.haas_bs'
        db.add_column(u'catalog_course', 'haas_bs',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.format'
        db.add_column(u'catalog_course', 'format',
                      self.gf('django.db.models.fields.CharField')(max_length=350, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Course.hs'
        db.add_column(u'catalog_course', 'hs',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.fall'
        db.add_column(u'catalog_course', 'fall',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.american_history'
        db.add_column(u'catalog_course', 'american_history',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.level'
        db.add_column(u'catalog_course', 'level',
                      self.gf('django.db.models.fields.CharField')(max_length=80, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Course.reading_a'
        db.add_column(u'catalog_course', 'reading_a',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.reading_b'
        db.add_column(u'catalog_course', 'reading_b',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.haas_al'
        db.add_column(u'catalog_course', 'haas_al',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.haas_pv'
        db.add_column(u'catalog_course', 'haas_pv',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.haas_ps'
        db.add_column(u'catalog_course', 'haas_ps',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.sbs'
        db.add_column(u'catalog_course', 'sbs',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.spring'
        db.add_column(u'catalog_course', 'spring',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.credit_option'
        db.add_column(u'catalog_course', 'credit_option',
                      self.gf('django.db.models.fields.CharField')(max_length=400, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Course.al'
        db.add_column(u'catalog_course', 'al',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.ins'
        db.add_column(u'catalog_course', 'ins',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.engineering'
        db.add_column(u'catalog_course', 'engineering',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.haas_sbs'
        db.add_column(u'catalog_course', 'haas_sbs',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.nbqr'
        db.add_column(u'catalog_course', 'nbqr',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.haas_hs'
        db.add_column(u'catalog_course', 'haas_hs',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.college_writing'
        db.add_column(u'catalog_course', 'college_writing',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.time'
        db.add_column(u'catalog_course', 'time',
                      self.gf('django.db.models.fields.CharField')(max_length=300, null=True, blank=True),
                      keep_default=False)

        # Adding field 'Course.bs'
        db.add_column(u'catalog_course', 'bs',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.chemistry'
        db.add_column(u'catalog_course', 'chemistry',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'Course.haas_ins'
        db.add_column(u'catalog_course', 'haas_ins',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Deleting field 'Course.hours'
        db.delete_column(u'catalog_course', 'hours')

        # Deleting field 'Course.grading'
        db.delete_column(u'catalog_course', 'grading')


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
            'Meta': {'object_name': 'Course'},
            'abbreviation': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'course_number': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'}),
            'department': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'default': "''"}),
            'enrolled': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'enrolled_max': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'enrolled_percentage': ('django.db.models.fields.FloatField', [], {'default': '-1'}),
            'favorite_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'grade_average': ('django.db.models.fields.FloatField', [], {'null': 'True'}),
            'grading': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'hours': ('django.db.models.fields.CharField', [], {'max_length': '350', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'letter_average': ('django.db.models.fields.CharField', [], {'max_length': '2', 'null': 'True', 'blank': 'True'}),
            'open_seats': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'prerequisites': ('django.db.models.fields.CharField', [], {'max_length': '400', 'null': 'True', 'blank': 'True'}),
            'previously': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'primary_kind': ('django.db.models.fields.CharField', [], {'max_length': '20', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '150', 'null': 'True', 'blank': 'True'}),
            'units': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'waitlisted': ('django.db.models.fields.IntegerField', [], {'default': '-1'})
        },
        u'catalog.enrollment': {
            'Meta': {'object_name': 'Enrollment'},
            'ccn': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'date_created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime(2015, 10, 28, 0, 0)'}),
            'enrolled': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'enrolled_max': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'live': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'manual_waitlist': ('django.db.models.fields.NullBooleanField', [], {'null': 'True', 'blank': 'True'}),
            'no_waitlist': ('django.db.models.fields.NullBooleanField', [], {'null': 'True', 'blank': 'True'}),
            'section': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['catalog.Section']"}),
            'semester': ('django.db.models.fields.CharField', [], {'max_length': '20'}),
            'waitlisted': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'waitlisted_max': ('django.db.models.fields.IntegerField', [], {'null': 'True'}),
            'year': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '4'})
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
            'final_end': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'final_start': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'instructor': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
            'is_primary': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'kind': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'last_updated': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'location': ('django.db.models.fields.CharField', [], {'max_length': '300', 'null': 'True', 'blank': 'True'}),
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
            'year': ('django.db.models.fields.CharField', [], {'max_length': '4', 'null': 'True', 'blank': 'True'})
        },
        u'catalog.updatelog': {
            'Meta': {'object_name': 'UpdateLog'},
            'date_created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'finished': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'message': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'semester': ('django.db.models.fields.CharField', [], {'default': "'spring'", 'max_length': '50'}),
            'started': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'year': ('django.db.models.fields.CharField', [], {'default': "'2016'", 'max_length': '4'})
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