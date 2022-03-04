import axios from "axios";
import { REACT_APP_API_URL } from "config";
import { KEY_GOOGLE_CLIENT_ID } from "config";
import React, { Component } from "react";
import { Nav } from "react-bootstrap";
import { GoogleLogin } from "react-google-login";
import { setAuthToken } from "utils/utils";

import { ReactComponent as GoogleIcon } from "../../assets/svg/profile/google.svg";

const ResponseGoogle = async (resp) => {
  const { id_token: idToken, access_token: accessToken } = resp.wc;
  console.log(idToken);
  console.log(accessToken);
  try {
    await axios.post(`${REACT_APP_API_URL}/users/google/callback`, {
      idToken,
      accessToken,
    });
    setAuthToken(idToken);
    localStorage.setItem("id_token", idToken);
    localStorage.setItem("access_token", accessToken);
    window.location.href = "/profile";
  } catch (e) {
    window.location.href = "/landing";
  }
  return <div></div>;
};

export class LoginButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <GoogleLogin
        clientId={KEY_GOOGLE_CLIENT_ID}
        render={(renderProps) => (
          <Nav.Link
            className="login-btn bt-bold bt-btn-primary btn-bt-md"
            eventKey={6}
            onClick={renderProps.onClick}
          >
            <GoogleIcon className="login-img" />
            Sign in with CalNet
          </Nav.Link>
        )}
        onSuccess={ResponseGoogle}
        cookiePolicy="none"
        hostedDomain="berkeley.edu"
        prompt="consent"
        responseType="id_token permission"
        scope="profile email https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/calendar.freebusy"
        // accessType="offline"
        // responseType="code"
        // redirectUri="http://localhost:8080/googleLanding"
        // uxMode="redirect"
      />
    );
  }
}

export default LoginButton;
