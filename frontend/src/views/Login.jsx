import React, { Component } from 'react';

class Login extends Component {

    constructor(props){
      super(props)
    }

    onSignIn(googleUser) {
        var profile = googleUser.getBasicProfile();
        print('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        print('Name: ' + profile.getName()); //
        print('Image URL: ' + profile.getImageUrl());
        print(('Email: ' + profile.getEmail()); // Null if the 'email' scope is not present.
    }

    render() {
      return (
          <script src="https://apis.google.com/js/platform.js" async defer></script>,
          <meta name="google-signin-client_id" content="YOUR_CLIENT_ID.apps.googleusercontent.com">,
          <div> Hello </div>,
          <div> Sign in </div>,
          <div class="g-signin2" data-onsuccess="onSignIn"></div>
      )
    }
}
