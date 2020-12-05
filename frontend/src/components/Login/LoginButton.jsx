import React, { Component } from 'react';
import { withRouter } from 'react-router';
import GoogleLogin, { GoogleLogout } from 'react-google-login';
import { Nav } from 'react-bootstrap'
import axios from 'axios';
import { connect } from 'react-redux';
import btn_google_signin from 'assets/svg/profile/btn_google_signin.png';

import { logIn } from '../../redux/auth/actions';

class LoginButton extends Component {
  constructor(props) {
    super(props);

    this.onSignIn = this.onSignIn.bind(this);
  }

  onSignIn(response) {
    const { history, logIn } = this.props;
    const tokenId = response.tokenId;
    axios.post(`/api/user/login/`,
      {
        tokenId: tokenId
      }
    ).then(res => {
        const data = res.data;
        let profileInfo = {
          token: data.token,
          email: data.user.user.email,
          firstName: data.user.user.first_name,
          lastName: data.user.user.last_name
        }
        logIn(profileInfo);
        history.push('/profile');
      },
      error => console.log('An error occurred.', error),
    );
  }

  render() {
    return (
      <GoogleLogin
        clientId="***REMOVED***"
        render={renderProps => (
          <Nav.Link
            className="login-btn bt-bold"
            eventKey={6}
            onClick={renderProps.onClick}
            disabled={renderProps.disabled}
          >
            <img className="login-img" src={btn_google_signin} />
          </Nav.Link>
        )}
        onSuccess={this.onSignIn}
        onFailure={error => alert('Sign-in failed with ' + JSON.stringify(error))}
        cookiePolicy="single_host_origin"
        scope="https://www.googleapis.com/auth/calendar"
        hostedDomain="berkeley.edu"
      />
    );
  }
}

const mapDispatchToProps = dispatch => ({
  dispatch,
  logIn: profile => dispatch(logIn(profile))
});

export default connect(
  null,
  mapDispatchToProps
)(withRouter(LoginButton));
