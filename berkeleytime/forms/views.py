import json
import traceback

from catalog.utils import is_post
from django.http import Http404
from datetime import datetime
import pytz
from dateutil.parser import parse

from hooks import dispatch_hooks
from berkeleytime.utils.requests import render_to_json
from googleapi import check_yaml_response, check_yaml_format, upload_file, ExpiredException
from utils import get_config_dict

# Returns YAML file (in JSON format) with name
def get_config(request, config_name):
	try:
		loaded_yaml = get_config_dict(config_name)

		form_config = {
			"info": {
				"unique_name": loaded_yaml["info"]["unique_name"],
				"public_name": loaded_yaml["info"]["public_name"],
				"description": loaded_yaml["info"]["description"]
			},
			"questions": []
		}

		if "close_on" in loaded_yaml["info"]:
			now = datetime.now(tz=pytz.utc).astimezone(pytz.timezone('US/Pacific'))
			due = parse(loaded_yaml["info"]["close_on"])
			print(now, due)
			if now > due:
				loaded_yaml["expired"] = True

		for index, question in enumerate(loaded_yaml["questions"]):
			question.update({
				"unique_name": "Question {}".format(index + 1)
			})
			form_config["questions"].append(question)

		return render_to_json(loaded_yaml)
	except (OSError, IOError):
		print("Error when trying to read file: {}".format("forms/configs/{}.yaml".format(config_name)))
		return False
	except Exception as e:
		print("Unexpected error within get_config. Raised error: " + str(e))
		return False


# Calls on the function that uploads response to google drive
def record_response(request):
	try:
		if is_post(request):
			form_response = json.loads(request.body)
			success = check_yaml_response(form_response["Config"], json.loads(request.body))
			dispatch_hooks(form_response)
			return render_to_json({
				'success': success
			})
		else:
			raise Http404
	except ExpiredException as e:
		return render_to_json({
				'success': False,
				'expired': True,
				'error': str(e),
			})
	except Exception as e:
		print e
		print traceback.print_exc()
		return render_to_json({
				'success': False,
				'error': str(e),
			})


def upload_file_view(request, config_name, file_name):
	try:
		if is_post(request):
			file_blob = request.body
			loaded_yaml = check_yaml_format(config_name)
			if "drive_folder_name" in loaded_yaml["info"]:
				drive_folder_name = loaded_yaml["info"]["drive_folder_name"]
			else:
				return render_to_json({
					'success': False,
					'error': 'No folder of that name exists.'
				})
			file_link = upload_file(drive_folder_name, file_name, file_blob)
			return render_to_json({
				'success': True,
				'link': file_link,
			})
		else:
			raise Http404
	except Exception as e:
		print e
		print traceback.print_exc()
		return render_to_json({
			'success': False,
			'error': str(e),
		})
