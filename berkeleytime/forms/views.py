from berkeleytime.utils.requests import render_to_json
from catalog.utils import is_post
from django.core.cache import cache
from django.http import Http404

from googleapi import check_yaml_response
from yaml import load, dump

# Returns YAML file (in JSON format) with name
def get_config(request, config_name):
	try:
		with open("forms/configs/{}.yaml".format(config_name), "r") as f:
			loaded_yaml = load(f.read())

		form_config = {
			"info": {
				"unique_name": loaded_yaml["info"]["unique_name"],
				"public_name": loaded_yaml["info"]["public_name"],
				"description": loaded_yaml["info"]["description"]
			},
			"questions": []
		}

		for index, question in enumerate(loaded_yaml["questions"]):
			question.update({
				"unique_name": "Question {}".format(index + 1)
			})
			form_config["questions"].append(question)

		return render_to_json(loaded_yaml)
	except FileNotFoundError:
		print("Error when trying to read file:", config_name + ".yaml", "ERROR: FileNoteFoundError")
	except Exception:
		print("Unexpected error within get_config. Raised error:")


# Calls on the function that uploads response to google drive
def record_response(request):
	try:
		if is_post(request):
			form_response = request.POST
			check_yaml_response("configs/" + form_response["Config"] + ".yaml", form_response)
		else:
			raise Http404
	except Exception as e:
		print e
	