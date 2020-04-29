import os
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from googleapiclient.discovery import build

from berkeleytime.settings import IS_LOCALHOST, IS_STAGING, IS_PRODUCTION
try:
    from yaml import load, dump, CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import load, dump, Loader, Dumper


def get_yaml_questions(loaded_yaml):
    question_mapping = {}
    questions = loaded_yaml["questions"]
    for count, question in enumerate(questions,1):
        question_mapping["Question "+str(count)] = question["type"]
    return question_mapping


# Global Variables
sheets_scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
drive_scope = ['https://www.googleapis.com/auth/drive.readonly.metadata', 'https://www.googleapis.com/auth/drive.file']

CACHED_SHEETS = {}
CACHED_CONFIGS = {}

# Raises some error, need to find
credentials = ServiceAccountCredentials.from_json_keyfile_name(os.environ["GOOGLE_APPLICATION_CREDENTIALS"], sheets_scope)
gc = gspread.authorize(credentials)
GMAIL_SERVICE = build('gmail', 'v1', credentials=credentials)
DRIVE_SERVICE = build('drive', 'v3', credentials=credentials)

for config in os.listdir('forms/configs'):
    if config == "__init__.py":
        continue
    f = open("forms/configs/{}".format(config))
    loaded_yaml = load(f, Loader=Loader)
    CACHED_CONFIGS[config.replace(".yaml", "")] = loaded_yaml
    if "googlesheet_link" in loaded_yaml["info"]:
        doc_url = loaded_yaml["info"]["googlesheet_link"]
        sheet = gc.open_by_url(doc_url).sheet1
        if sheet:
            CACHED_SHEETS[doc_url] = gc.open_by_url(doc_url).sheet1


def get_config_dict(config):
    if IS_STAGING or IS_PRODUCTION:
        return CACHED_CONFIGS[config]
    elif IS_LOCALHOST:
        return load(open("forms/configs/{}.yaml".format(config)), Loader=Loader)