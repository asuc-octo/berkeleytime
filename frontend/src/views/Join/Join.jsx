import React, { PureComponent } from 'react';
import { Row, ButtonToolbar } from 'react-bootstrap';
import PositionCard from '../../components/Recruiting/Position';

import doe from '../../assets/img/images/about/group/doe.jpg';

const IS_RECRUITING = true;

class Join extends PureComponent {

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
          <h5>Join the BT Team! &#x270C; </h5>
          <p>
            We'll be recruiting for new team members in the fall! Sign up to hear about recruitment updates.
          </p>
        </div>
        <ButtonToolbar className="releases-heading-button join">
          <input placeholder="Your email address" type="text" id="mailInput" onChange={this.handleInputChange}></input>
          <button disabled={submitting || submissionSuccess} className="btn btn-bt-primary btn-bt-sm" onClick={this.submit}>
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
          <h5>Join the BT Team! &#x270C; </h5>
          <p>
            We are currently recruiting new members for various positions in the Berkeleytime team. Check out the positions below. Each application has additional information about the role,
            requirements, and position specific application timeline. If you feel interested in multiple positions, please submit a separate application for each role.
          </p>
        </div>
        <Row className="position-card-row">
          <PositionCard
            position="Backend Engineer"
            emoji="💻"
            description="Backend engineers build on Berkeleytime's core systems and APIs. Projects include scheduling, API enhancements, user profiles, authentication, and more."
            link="/join"
          />
          <PositionCard
            position="Frontend Engineer"
            emoji="🖼️"
            description="Our frontend engineers work on creating our React based frontend. Projects include the user login flow, scheduler, mobile view, and more."
            link="/join"
          />
        </Row>
        <Row className="position-card-row">
          <PositionCard
            position="Product Designer"
            emoji="🎨"
            description="Product designers define Berkeleytime's design system and work closely with engineers to create new features and user flows."
            link="/apply/design"
          />
          <PositionCard
            position="Infrastructure Engineer"
            emoji="🏗️"
            description="Work with a production Kubernetes cluster to manage deployment, automate builds, and build out our complex service oriented infrastructure."
            link="/join"
          />
        </Row>
      </div>
      )
    }


  }
}


export default Join;
