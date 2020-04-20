from __future__ import division
import re, os, sys, datetime
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from django.core.cache import cache
from django.db.models import Avg, Sum
from django.shortcuts import render_to_response
from django.template import RequestContext

from googleapi import *
from yaml import load, dump, CLoader as Loader, CDumper as Dumper

# Returns YAML file (in JSON format) with name
def get_config(request, config_name):
# YAML_PATH is the filepath to the yaml file
	try:
		file = open(config_name + ".yaml")
		loaded_yaml = load(file, Loader=Loader)
		return render_to_json(loaded_yaml)
	except FileNotFoundError:
		print("Error when trying to read file:", config_name + ".yaml", "ERROR: FileNoteFoundError")
	except:
		print("Unexpected error within get_config. Raised error:")
		raise

# Calls on the function that uploads response to google drive
# Form_response would be (<example>,<blah>),(<example1>,<blah1>),...
def record_response(request, config_name, form_response):
	check_yaml_response(config_name + ".yaml", list(ast.literal_eval(form_response)))