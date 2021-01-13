import os

import google_auth_oauthlib.flow
from django.http import HttpResponseRedirect

from berkeleytime.utils import render_to_json


def login(request):
    # Use the client_secret.json file to identify the application requesting
    # authorization. The client ID (from that file) and access scopes are required.
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        os.getenv('GOOGLE_SIGNIN_CLIENT_SECRET_FILEPATH'),
        scopes=[
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ]
    )

    # Indicate where the API server will redirect the user after the user completes
    # the authorization flow. The redirect URI is required. The value must exactly
    # match one of the authorized redirect URIs for the OAuth 2.0 client, which you
    # configured in the API Console. If this value doesn't match an authorized URI,
    # you will get a 'redirect_uri_mismatch' error.
    flow.redirect_uri = request.build_absolute_uri(
        '/api/oauth2callback/').replace('http', 'https')

    # Generate URL for request to Google's OAuth 2.0 server.
    # Use kwargs to set optional request parameters.
    authorization_url, state = flow.authorization_url(
        # Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes='true')

    return HttpResponseRedirect(authorization_url)


def oauth2callback(request):
    # get ID token from auth code
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        os.getenv('GOOGLE_SIGNIN_CLIENT_SECRET_FILEPATH'),
        scopes=[
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ])
    flow.redirect_uri = request.build_absolute_uri(
        '/api/oauth2callback/').replace('http', 'https')
    flow.fetch_token(code=request.GET.get('code'))
    id_token = flow.credentials.id_token

    return HttpResponseRedirect(
        f'{request.build_absolute_uri("/oauth2callback")}?id_token={id_token}'.replace('http', 'https'))
