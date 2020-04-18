import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState(prevState => ({ open: !prevState.open }));
  }

  render() {
    const links = Navigation.links;
    const { banner } = this.props;
    const { open } = this.state;

    return (
      <Navbar
        fixed="top"
        expand="lg"
        bg="white"
        className={`bt-navbar ${banner ? 'bt-navbar-banner' : ''}`}
        expanded={open}
      >
        <Navbar.Brand as={Link} to="/">Berkeleytime</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" onClick={() => this.toggle(!open)} />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto" />
          <Nav>
            {
              links.map(link => (
                <Nav.Link as={Link} to={link.to} key={link.text} onClick={this.toggle}>
                  {link.text}
                </Nav.Link>
              ))
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

Navigation.links = [
  {
    to: '/catalog',
    text: 'Courses',
  },
  {
    to: '/grades',
    text: 'Grades',
  },
  {
    to: '/enrollment',
    text: 'Enrollment',
  },
  {
    to: '/about',
    text: 'About',
  },
  {
    to: '/faq',
    text: 'FAQ',
  },
  // {
  //   to: '/login',
  //   text: 'Login',
  // },
];

Navigation.propTypes = {
  banner: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  const { banner } = state.banner;
  return {
    banner,
  };
};

export default connect(mapStateToProps)(Navigation);
