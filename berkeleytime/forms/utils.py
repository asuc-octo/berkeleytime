import os
import gspread
import base64
from oauth2client.service_account import ServiceAccountCredentials
from googleapiclient.discovery import build
from email.mime.text import MIMEText
from smtplib import SMTP

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
GMAIL_SERVICE = SMTP('smtp.gmail.com', port=587)
GMAIL_SERVICE.starttls()
GMAIL_SERVICE.login(os.environ["GOOGLE_EMAIL"], os.environ["GOOGLE_PASS"])
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


def send_message(to, subject, message_text):
    sender = "octo.berkeleytime@asuc.org"
    message = MIMEText(message_text, 'html')
    if isinstance(to, list):
        message['to'] = ", ".join(to)
    else:
        message['to'] = to
    print("Sending an email to " + message['to'])
    message['from'] = sender
    message['subject'] = subject

    try:
        message = GMAIL_SERVICE.sendmail("octo.berkeleytime@asuc.org", message['to'], message.as_string())
        return message
    except Exception as error:
        print 'An error occurred: %s' % error
