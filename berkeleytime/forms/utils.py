import os
import gspread
import base64
from oauth2client.service_account import ServiceAccountCredentials
from googleapiclient.discovery import build
from email.mime.text import MIMEText

from berkeleytime.settings import IS_LOCALHOST, IS_STAGING, IS_PRODUCTION
try:
    from yaml import load, dump, CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import load, dump, Loader, Dumper


# Global Variables
scopes = [
    'https://spreadsheets.google.com/feeds',
    'https://www.googleapis.com/auth/drive'
]

CACHED_SHEETS = {}
CACHED_CONFIGS = {}

# Raises some error, need to find
credentials = ServiceAccountCredentials.from_json_keyfile_name(os.environ["GOOGLE_APPLICATION_CREDENTIALS"], scopes)
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


def send_message(service, user_id, message):
    try:
        message = service.users().messages().send(userId=user_id, body=message).execute()
        return message
    except Exception as error:
        print 'An error occurred: %s' % error


def send_message(to, subject, message_text):
    sender = "octo.berkeleytime@asuc.org"
    message = MIMEText(message_text)
    if isinstance(to, list):
        message['to'] = to = ", ".join(to)
    else:
        message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    toSend = {'raw': base64.urlsafe_b64encode(message.as_string())}

    try:
        message = GMAIL_SERVICE.users().messages().send(userId="octo.berkeleytime@asuc.org", body=toSend).execute()
        return message
    except Exception as error:
        print 'An error occurred: %s' % error
