from oauth2client.service_account import ServiceAccountCredentials
from googleapiclient import discovery
from httplib2 import Http
from oauth2client import file, client, tools
from apiclient.http import MediaFileUpload, MediaInMemoryUpload
try:
    from yaml import load, dump, CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import load, dump, Loader, Dumper
from datetime import datetime

import gspread
import os
import sys
import redlock

# Global Variables
sheets_scope = ['https://spreadsheets.google.com/feeds',
         'https://www.googleapis.com/auth/drive']
drive_scope = ['https://www.googleapis.com/auth/drive.readonly.metadata', 
							 'https://www.googleapis.com/auth/drive.file']
dlm = redlock.Redlock([{"host": "localhost", "port": 6379, "db": 0}, ])

# Reads in a YAML file and checks if it is properly formed
# Returns YAML file in dictionary form
def check_yaml_format(yaml_path):
	# YAML_PATH is the filepath to the yaml file
	try:
		file = open(yaml_path)
		loaded_yaml = load(file, Loader=Loader)
		# REQUIRED FIELDS:
		# info field with googlesheet_link
		if "info" not in loaded_yaml or "googlesheet_link" not in loaded_yaml["info"]:
			print("The 'info' field is malformed (missing or does not contain \
				'unique_name' and 'googlesheet_link'.")
			return None
		# questions field that holds a list
		if "questions" not in loaded_yaml or not isinstance(loaded_yaml["questions"], list):
			print("The 'questions' field is malformed (missing or does not contain a list).")
			return None
		return loaded_yaml
	except FileNotFoundError:
		print("Error when trying to read file:", yaml_path, "ERROR: FileNoteFoundError")
	except:
		print("Unexpected error within check_yaml_format. Raised error:")
		raise

# Uploads FILE_BLOB to folder called FOLDER_NAME
# Returns the webViewLink of uploaded file
def upload_file(folder_name, file_name, file_blob):
	# FOLDER_NAME is the name of the folder to upload the file to
	# FILE_BLOB is the file blob to upload

	credentials = ServiceAccountCredentials.from_json_keyfile_name(
		os.environ["GOOGLE_APPLICATION_CREDENTIALS"], drive_scope)
	drive = discovery.build('drive', 'v3', credentials=credentials)

	folders = drive.files().list(q="mimeType='application/vnd.google-apps.folder'",
	                           spaces='drive',
	                           fields='nextPageToken, files(id, name)',
	                           pageToken=None).execute().get('files', [])

	# Finding folder id of requested folder (unassigned if not found)
	folder_id = 'none'
	# Other variables needed to check if folder creation is needed
	base_folder_id = 'none'
	unassigned_bool = False
	for f in folders:
		if f['name'] == folder_name:
			folder_id = f['id']
		elif folder_id == 'none' and f['name'] == 'unassigned':
			folder_id = f['id']
			unassigned_bool = True

		if (f['name'] == "InternalSubmissionForm"):
			base_folder_id = f['id']

	# If the given folder is NOT "" or None AND was unassigned, we will create the folder
	# We will not create a folder if the given name is nothing
	if ((not folder_name == "") or (not folder_name)) and unassigned_bool:
		file_metadata = {'name': folder_name, 'mimeType': 'application/vnd.google-apps.folder',
			'parents': [base_folder_id]}
		folder = drive.files().create(body=file_metadata, fields='id').execute()
		folder_id = folder.get('id')


	file_front, file_ext = os.path.splitext(file_name)
	file_metadata = {'name': file_front + "_" + datetime.utcnow().strftime("%Y.%m.%d.%H.%M.%S") + \
		file_ext, 'parents': [folder_id]}
	media = MediaInMemoryUpload(file_blob)
	file = drive.files().create(body=file_metadata, media_body=media, fields='id').execute()

	return drive.files().get(fileId=file["id"], fields='webViewLink').execute()["webViewLink"]

# Appends RESPONSES to a google sheet specified by doc_url
def sheet_add_next_entry(doc_url, responses):
	# DOC_URL is the url of the google sheet
	# RESPONSES is a list of strings

	if (type(doc_url) is not str):
		print("doc_url is not a string") # TODO replace with proper error
		return

	# Raises some error, need to find
	credentials = ServiceAccountCredentials.from_json_keyfile_name(
		os.environ["GOOGLE_APPLICATION_CREDENTIALS"], sheets_scope)
	gc = gspread.authorize(credentials)

	# Need to acquire lock (ensure that only one instance is modifying the sheet at a time)
	my_lock = dlm.lock("google_spreadsheet",2000)

	# Raises a gspread.SpreadsheetNotFound if no spreadsheet is found
	try:
		sheet = gc.open_by_url(doc_url).sheet1
	except:
		print("Error opening spreadsheet")
		raise

	j = 1
	while (sheet.cell(j, 1).value):
		j += 1

	for count, response in enumerate(responses):
		sheet.update_cell(j, 1 + count, response)

	dlm.unlock(my_lock)

	return True

# Checks if RESPONSES matches the YAML configuration
# Uploads the response to GoogleDrive
# Returns True if successful, False otherwise
def check_yaml_response(yaml_path, responses):
	# YAML_PATH is the filepath to the yaml file
	# RESPONSES is a list of the responses [(type, response)], where the first
	# tuple (index 0) HAS to be ("unique_name", <unique_name>).

	loaded_yaml = check_yaml_format(yaml_path)
	if not loaded_yaml:
		print("Failed to read yaml configuration file:", yaml_path)
		print("Aborting.")
		return False

	# Sanity check if responses is correctly formed (with name tuple first)
	if not responses[0][0] == "unique_name":
		print("Responses does not contain the unique_name tuple.")

	# Sanity check if correct YAML is being used
	if not loaded_yaml["info"]["unique_name"] == responses[0][1] or \
		not len(responses) - 1 == len(loaded_yaml["questions"]):
		print("Incorrect YAML configuration:", loaded_yaml["info"]["unique_name"], \
			"for responses:", loaded_yaml["info"]["unique_name"], "or malformed responses")
		return False

	# Uploading files first to retrieve drive URLs
	if "drive_folder_name" in loaded_yaml["info"]:
		drive_folder_name = loaded_yaml["info"]["drive_folder_name"]
	else:
		drive_folder_name = ""

	sheet_responses = []
	for resp_type,response in responses:
		if resp_type == "unique_name":
			pass
		elif resp_type == "file":
			if type(response) is tuple:
				file_link = upload_file(drive_folder_name, response[0], response[1])
				sheet_responses.append(file_link)
			else:
				print("Response for file upload is malformed")
				return False
		else:
			sheet_responses.append(response)

	# Sanity check that we have enough responses
	if not (len(sheet_responses) == len(loaded_yaml["questions"])):
		print("Malformed responses. # of collected responses:", len(sheet_responses), \
			"# of questions:", len(loaded_yaml["questions"]))
		return False

	# Uploading to Google Sheets
	return sheet_add_next_entry(loaded_yaml["info"]["googlesheet_link"], sheet_responses)

# # Deletes all files accessible by service account. Commented out due to dangerous operation
# # Used to remove testing files
# def delete_all_files():
# 	files = drive.files().list(q="mimeType='text/plain'",
# 	                           spaces='drive',
# 	                           fields='nextPageToken, files(id, name)',
# 	                           pageToken=None).execute().get('files', [])
# 	print(files)
# 	for file in files:
# 		drive.files().delete(fileId=file.get('id')).execute()
# 	files = drive.files().list(q="mimeType='text/plain'",
# 	                           spaces='drive',
# 	                           fields='nextPageToken, files(id, name)',
# 	                           pageToken=None).execute().get('files', [])
# 	print(files)
