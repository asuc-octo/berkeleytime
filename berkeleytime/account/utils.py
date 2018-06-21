from googleapiclient.discovery import build
from allauth.socialaccount.models import SocialAccount
from oauth2client.client import GoogleCredentials
import json
import httplib2
import os

#Tools for interfacing BerkeleytimeUserProfile with Facebook

def check_user_authentication(request):
    """
    return request.user if user is authenticated, False otherwise

    """
    if request.user.is_authenticated():
        return request.user
    return False

def has_facebook(user):
    profile = user.berkeleytimeuserprofile
    if profile.facebook_id is not None:
        return True
    return False

def generic_name(user):
    profile = user.berkeleytimeuserprofile
    if has_facebook(user):
        return profile.facebook_name
    return user.username

def generic_info(user):
    profile = user.berkeleytimeuserprofile
    if has_facebook(user):
        return {"name": profile.facebook_name, "facebook_id": profile.facebook_id}
    return {"name": user.username, "facebook_id": None}

# Tool for Google Cal

# with open('account/client_secret.json') as data_file:
#     secrets = json.load(data_file)["web"]

def get_google_cal_service(request):
    user_account = SocialAccount.objects.get(user=request.user)
    user_token = user_account.socialtoken_set.first()
    print user_token.token
    print user_token.expires_at
    print user_token.token_secret
    credentials = GoogleCredentials(
        access_token=user_token.token,
        client_id=os.environ["GOOGLE_CLIENT_ID"],
        #client_id=secrets["client_id"],
        client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
        #client_secret=secrets["client_secret"],
        token_uri=os.environ["GOOGLE_TOKEN_URI"],
        #token_uri=secrets["token_uri"],
        refresh_token=user_token.token_secret,
        user_agent="MyAgent/1.0",
        token_expiry=user_token.expires_at,
    )

    return build('calendar', 'v3', credentials=credentials, cache_discovery=False)
