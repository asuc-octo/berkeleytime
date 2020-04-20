import React, { PureComponent } from 'react';
import { Row, Col, ButtonToolbar, Form } from 'react-bootstrap';
import retreat_silly from '../../assets/img/images/about/group/retreat_silly.png';
import janet_jemma from '../../assets/img/images/about/group/janet_jemma.jpg';


class Apply extends PureComponent {
  render() {
    const { values } = this.props;

    return (
      <div className="apply">
        <div className="application">
        <div className="application-header">
          <h5>Fall 2020 Backend Engineer Application</h5>
          <p>
            Read more about the role <a href = "">here</a>.
          </p>
          </div>

          <Form>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Label className="required">Full Name</Form.Label>
              <Form.Control type="email" placeholder="Britney Spears" />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Label className="required">Email address</Form.Label>
              <Form.Control type="email" placeholder="britneyspears@berkeley.edu" />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Label className="required">Phone Number</Form.Label>
              <Form.Control type="email" placeholder="1-800-Hit-Me-Baby-One-More-Time" />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlSelect1">
              <Form.Label className="required">Current Year</Form.Label>
              <Form.Control as="select">
                <option>Freshman</option>
                <option>Sophomore</option>
                <option>Junior</option>
                <option>Senior</option>
                <option>Super Senior</option>
                <option>Master's Student/Other</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Label className="required">Github Link</Form.Label>
              <Form.Control type="email" placeholder="github.com/britneyspears" />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Label className="required">Linkedin</Form.Label>
              <Form.Control type="email" placeholder="linkedin.com/in/britneyspears" />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Label>Personal Website or Portfolio</Form.Label>
              <Form.Control type="email" placeholder="britneyspears.com" />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Label>Additional Link(s)</Form.Label>
              <Form.Control type="email" placeholder="twitter.com/britneyspears" />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlSelect1">
              <Form.Label className="required">Upload Your Resume</Form.Label>
              <Form.File
                  id="custom-file"
                  label="Resume"
                  custom
                />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label className="required">Why are you interested in working on the BT team?</Form.Label>
              <p className="descriptor">250 words max</p>
              <Form.Control placeholder="Your answer..." as="textarea" rows="3" />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label className="required">What do you hope to get out of your experience?</Form.Label>
              <p className="descriptor">250 words max</p>
              <Form.Control placeholder="Your answer..." as="textarea" rows="3" />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label className="required">What are some features you'd like to see implemented on our site? Why?</Form.Label>
              <p className="descriptor">250 words max; please exclude scheduler</p>
              <Form.Control placeholder="Your answer..." as="textarea" rows="3" />
            </Form.Group>
            <Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label className="required">Please list class you are taking and your other commitments for this semester.</Form.Label>
              <Form.Control placeholder="Your answer..." as="textarea" rows="3" />
            </Form.Group>
          </Form>

          <ButtonToolbar className="releases-heading-button join">
            <a href="/apply" role="button">
            <button className="btn btn-bt-primary btn-bt-sm">
              Submit Application
            </button>
            </a>
          </ButtonToolbar>
        </div>



      </div>

    );
  }
}


export default Apply;
