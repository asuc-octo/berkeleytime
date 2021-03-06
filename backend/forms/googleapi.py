import os
import time
from datetime import datetime
from urllib.parse import urlparse

import pytz
import redlock
from dateutil.parser import parse
from googleapiclient.http import MediaFileUpload, MediaInMemoryUpload

from berkeleytime.settings import IS_LOCALHOST
from forms.utils import get_config_dict, CACHED_SHEETS, DRIVE_SERVICE

if IS_LOCALHOST:
    dlm = redlock.Redlock([{'host': 'redis', 'port': 6379},])
else:
    REDIS = urlparse(os.environ.get('REDIS_URL'))
    dlm = redlock.Redlock([{'host': REDIS.hostname, 'port': REDIS.port, 'password': REDIS.password},])


class ExpiredException(Exception):
    pass

# Reads in a YAML file and checks if it is properly formed
# Returns YAML file in dictionary form
def check_yaml_format(config_name):
    # YAML_PATH is the filepath to the yaml file
    try:
        loaded_yaml = get_config_dict(config_name)
        # REQUIRED FIELDS:
        # info field with googlesheet_link
        if 'info' not in loaded_yaml or 'googlesheet_link' not in loaded_yaml['info']:
            print("The 'info' field is malformed (missing or does not contain \
                'unique_name' and 'googlesheet_link'.")
            return None
        # questions field that holds a list
        if 'questions' not in loaded_yaml or not isinstance(loaded_yaml['questions'], list):
            print("The 'questions' field is malformed (missing or does not contain a list).")
            return None
        return loaded_yaml
    except (OSError, IOError):
        print('Error when trying to read file: {}'.format(yaml_path))
        return None
    except Exception as e:
        print('Unexpected error within check_yaml_format. Raised error: ' + e)
        return None


# Uploads FILE_BLOB to folder called FOLDER_NAME
# Returns the webViewLink of uploaded file
def upload_file(folder_name, file_name, file_blob):
    # FOLDER_NAME is the name of the folder to upload the file to
    # FILE_BLOB is the file blob to upload

    folders = DRIVE_SERVICE.files().list(q="mimeType='application/vnd.google-apps.folder'",
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

        if (f['name'] == 'InternalSubmissionForm'):
            base_folder_id = f['id']

    # If the given folder is not empty AND was unassigned, we will create the folder
    # We will not create a folder if the given name is nothing
    if folder_name and unassigned_bool:
        file_metadata = {'name': folder_name, 'mimeType': 'application/vnd.google-apps.folder',
            'parents': [base_folder_id]}
        folder = drive.files().create(body=file_metadata, fields='id').execute()
        folder_id = folder.get('id')

    file_front, file_ext = os.path.splitext(file_name)
    upload_time = datetime.now(tz=pytz.utc).astimezone(pytz.timezone('US/Pacific')).strftime('%Y.%m.%d %H.%M.%S')
    file = DRIVE_SERVICE.files().create(
        body={
            'name': file_front + '_' + upload_time + file_ext,
            'parents': [folder_id]
        },
        media_body=MediaInMemoryUpload(file_blob),
        fields='id'
    ).execute()

    DRIVE_SERVICE.permissions().create(
        fileId=file.get('id'),
        body={
            'type': 'anyone',
            'role': 'reader',
        },
        fields='id',
    ).execute()

    return DRIVE_SERVICE.files().get(fileId=file['id'], fields='webViewLink').execute()['webViewLink']


# Appends RESPONSES to a google sheet specified by doc_url
def sheet_add_next_entry(doc_url, responses):
    # DOC_URL is the url of the google sheet
    # RESPONSES is a list of strings

    if (type(doc_url) is not str):
        raise Exception('doc_url is not a string') # TODO replace with proper error

    if doc_url not in CACHED_SHEETS:
        raise Exception('Error opening spreadsheet')

    # Need to acquire lock (ensure that only one instance is modifying the sheet at a time)
    my_lock = False
    for _ in range(5):
        my_lock = dlm.lock('google_spreadsheet_' + str(hash(doc_url)), 2000)
        if my_lock:
            break
        else:
            time.sleep(0.2)
    if not my_lock:
        raise Exception('failed to acquire lock')

    sheet = CACHED_SHEETS[doc_url]
    col1 = sheet.col_values(1)
    next_row = len(col1) + 1
    cell_list = sheet.range('A{}:{}{}'.format(next_row, chr(ord('A') + len(responses) - 1), next_row))
    for index, response in enumerate(responses):
        cell_list[index].value = response
    sheet.update_cells(cell_list)

    dlm.unlock(my_lock)
    return True

# Checks if RESPONSES matches the YAML configuration
# Uploads the response to GoogleDrive
# Returns True if successful, False otherwise
def check_yaml_response(config_name, responses):
    # YAML_PATH is the filepath to the yaml file
    # RESPONSES is a list of the responses [(type, response)], where the first
    # tuple (index 0) HAS to be ('unique_name', <unique_name>).

    loaded_yaml = check_yaml_format(config_name)
    if not loaded_yaml:
        print('Failed to read yaml configuration file:', config_name)
        print('Aborting.')
        return False

    # Sanity check if responses is correctly formed (with name tuple first)
    if 'Config' not in responses:
        print('Responses does not contain the Config key.')
        return False

    # Sanity check if correct YAML is being used
    if not loaded_yaml['info']['unique_name'] == responses['Config']:
        print('Incorrect YAML configuration:', loaded_yaml['info']['unique_name'], \
            'for responses:', loaded_yaml['info']['unique_name'])
        return False

    if 'close_on' in loaded_yaml['info']:
        now = datetime.now(tz=pytz.utc).astimezone(pytz.timezone('US/Pacific'))
        due = parse(loaded_yaml['info']['close_on'])
        print(now, due)
        if now > due:
            raise ExpiredException('The form has now expired.')

    sheet_responses = []
    sheet_responses.append(datetime.now(tz=pytz.utc).astimezone(pytz.timezone('US/Pacific')).strftime('%Y.%m.%d %H.%M.%S'))
    for q_numb in range(0, len(loaded_yaml['questions'])):
        question_id = 'Question ' + str(q_numb + 1)
        if question_id in responses:
            response = responses[question_id]
            sheet_responses.append(response)
        else:
            sheet_responses.append('N/A')

    # Sanity check that we have enough responses
    if not ((len(sheet_responses) - 1) == len(loaded_yaml['questions'])):
        print('Malformed responses. # of collected responses:', len(sheet_responses) - 1, \
            '# of questions:', len(loaded_yaml['questions']))
        return False

    # Uploading to Google Sheets
    return sheet_add_next_entry(loaded_yaml['info']['googlesheet_link'], sheet_responses)

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
