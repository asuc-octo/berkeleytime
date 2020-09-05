import React, { Component } from 'react';

// eslint-disable-next-line no-unused-vars
class Login extends Component {

  onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    print(`ID: ${profile.getId()}`); // Do not send to your backend! Use an ID token instead.
    print(`Name: ${profile.getName()}`); //
    print(`Image URL: ${profile.getImageUrl()}`);
    print(`Email: ${profile.getEmail()}`); // Null if the 'email' scope is not present.
  }

  render() {
    return (
      <script src="https://apis.google.com/js/platform.js" async defer />,
        <meta name="google-signin-client_id" content="YOUR_CLIENT_ID.apps.googleusercontent.com" />,
        <div> Hello </div>,
        <div> Sign in </div>,
        <div className="g-signin2" data-onsuccess="onSignIn" />
    );
  }
}
