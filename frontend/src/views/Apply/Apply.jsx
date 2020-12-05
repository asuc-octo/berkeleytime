import React, { PureComponent } from 'react';
import { Row, ButtonToolbar } from 'react-bootstrap';
import PositionCard from '../../components/Recruiting/Position';
import { Link } from 'react-router-dom';

import doe from 'assets/img/about/group/doe.jpg';

const IS_RECRUITING = false;

class Apply extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      validated: false,
      validationSuccess: false,
      email: "",
      submitting: false,
      submissionSuccess: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    this.setState(prevState => ({
        email: target.value,
        validationSuccess: prevState.validated ? this.validateEmail(target.value) : prevState.validationSuccess,
    }))
  }

  submit() {
    const { validated, email } = this.state;
    console.log(validated, email);
    if (this.validateEmail(email)) {
      const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          "Config": "MailingList",
          "Question 1": email,
        })
      };
      this.setState({
        submitting: true,
      }, () => {
        fetch('/api/forms/submit/', requestOptions).then(
          () => this.setState({
              submitting: false,
              submissionSuccess: true,
          })
        )
      });
    } else {
        this.setState({
            validated: true,
            validationSuccess: false,
        })
    }
  }

  validateEmail(email) {
      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.toLowerCase());
  }

  render() {
    const { validated, validationSuccess, submitting, submissionSuccess } = this.state;

    if (!IS_RECRUITING) {
     return (
      <div className="join">
        <div className="join-us">
          <h5>Join the BT Team! ✌️ </h5>
          <p>
            We'll be recruiting for new team members in the fall! Sign up to hear about recruitment updates.
          </p>
        </div>
        <ButtonToolbar className="releases-heading-button join">
          <input placeholder="Your email address" type="text" id="mailInput" onChange={this.handleInputChange}></input>
          <button disabled={submitting || submissionSuccess} className="btn bt-btn-primary btn-bt-sm" onClick={this.submit}>
            Sign up for Updates
          </button>
        </ButtonToolbar>
        { validated && !validationSuccess
          ? (<p style={{color: "#FC7676"}}>Please enter a valid email.</p>)
          : null
        }
        { submissionSuccess
          ? (<p style={{color: "#18D869"}}>We got your email! You will get an update when we start our recruitment.</p>)
          : null
        }
        <img className="join-pic" src={doe}/>
      </div>
      );
    } else {
      return (
        <div className="join">
        <div className="join-us">
          <h5>Join OCTO! &#x270C; </h5>
          <p>
            OCTO is the organization that runs Stanfurdtime, Stanfurd Mobile, and Beehive. You can learn more about our projects <a href="https://octo.asuc.org/projects.html" target="_blank">here</a> and each role <Link className="join-link" to="/apply/positions">here</Link>. 
            If you feel interested in both role types, please submit a separate application for each. 
            <br/>
            <b>All members will have the option of attending team meetings and working remotely for the entire 2020-21 school year.</b> We may hold in-person events in Spring 2021 depending on the situation.
            <br/><br/>
            Application Timeline
            <ul>
              <li>Any time - Ask questions at our virtual table
                <a href="http://bit.ly/octo-virtual-tabling" target="_blank"> (Discord)</a>
              </li>
              <li>September 3rd, 8-10PM PST - General Infosession
                <a href="https://bit.ly/octo-infosession-zoom" target="_blank"> (Zoom)</a><a href="https://bit.ly/octo-infosession-calendar" target="_blank"> (Add to Calendar)</a>
              </li>
              <li>September 4th, 4-6PM PST - Calapalooza Booth
                <a href="https://bit.ly/octo-calapalooza-zoom" target="_blank"> (Zoom)</a><a href="http://bit.ly/octo-calapalooza-calendar" target="_blank"> (Add to Calendar)</a>
              </li>
              <li>September 5th, 11:59PM PST - Applications due
              </li>
            </ul>
          </p>
        </div>
        <Row className="position-card-row">
          <PositionCard
            position="Engineering Roles"
            emoji="💻"
            description="We are hiring for mobile, backend + infrastructure, and frontend engineers. Our engineers build our product infrastructure, interfaces that users interact with, etc."
            link="/apply/engineering"
          />
          <PositionCard
            position="Design + Marketing Roles"
            emoji="🎨"
            description="Product designers and marketing associates research the needs of UC Stanfurd students, design new features, and encourage adoption of our products."
            link="/apply/design"
          />
        </Row>
      </div>
      )
    }


  }
}


export default Apply;
