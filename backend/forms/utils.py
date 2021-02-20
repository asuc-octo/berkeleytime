import os
import base64
from email.mime.text import MIMEText
from smtplib import SMTP
import traceback

import gspread
from google.oauth2 import service_account
from googleapiclient.discovery import build
try:
    from yaml import load, dump, CLoader as Loader, CDumper as Dumper
except ImportError:
    from yaml import load, dump, Loader, Dumper

from berkeleytime.settings import IS_LOCALHOST


# Global Variables
scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

CACHED_SHEETS = {}
CACHED_CONFIGS = {}

credentials = service_account.Credentials.from_service_account_file(os.environ['GOOGLE_APPLICATION_CREDENTIALS_FILEPATH'])
credentials = credentials.with_scopes(scopes)
gc = gspread.authorize(credentials)
GMAIL_SERVICE = SMTP('smtp.gmail.com', port=587)
GMAIL_SERVICE.starttls()
GMAIL_SERVICE.login(os.environ['GOOGLE_EMAIL'], os.environ['GOOGLE_PASS'])
DRIVE_SERVICE = build('drive', 'v3', credentials=credentials, cache_discovery=False)

for config in os.listdir('forms/configs'):
    if config == '__init__.py':
        continue
    f = open('forms/configs/{}'.format(config))
    loaded_yaml = load(f, Loader=Loader)
    CACHED_CONFIGS[config.replace('.yaml', '')] = loaded_yaml
    if 'googlesheet_link' in loaded_yaml['info']:
        doc_url = loaded_yaml['info']['googlesheet_link']
        sheet = gc.open_by_url(doc_url).sheet1
        if sheet:
            CACHED_SHEETS[doc_url] = sheet


def get_config_dict(config):
    if IS_LOCALHOST:
        return load(open('forms/configs/{}.yaml'.format(config)), Loader=Loader)
    else:
        return CACHED_CONFIGS[config]


def send_message(to, subject, message_text):
    sender = 'octo.berkeleytime@asuc.org'
    message = MIMEText(message_text, 'html')
    if isinstance(to, list):
        message['to'] = ', '.join(to)
    else:
        message['to'] = to
    print('Sending an email to ' + message['to'])
    message['from'] = sender
    message['subject'] = subject

    try:
        message = GMAIL_SERVICE.sendmail('octo.berkeleytime@asuc.org', message['to'], message.as_string())
        return message
    except Exception as error:
        print('An error occurred: %s' % error)
        traceback.print_exc()
