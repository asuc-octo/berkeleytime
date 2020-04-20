from berkeleytime.utils.requests import render_to_json

from googleapi import check_yaml_response
try:
    from yaml import load, dump, CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import load, dump, Loader, Dumper

# Returns YAML file (in JSON format) with name
def get_config(request, config_name):

	try:
		with open("forms/configs/{}.yaml".format(config_name), "r") as f:
			loaded_yaml = load(f, Loader=Loader)
		return render_to_json(loaded_yaml)
	except FileNotFoundError:
		print("Error when trying to read file:", config_name + ".yaml", "ERROR: FileNoteFoundError")
	except Exception:
		print("Unexpected error within get_config. Raised error:")


# Calls on the function that uploads response to google drive
# Form_response would be (<example>,<blah>),(<example1>,<blah1>),...
def record_response(request, config_name, form_response):
	check_yaml_response(config_name + ".yaml", list(ast.literal_eval(form_response)))