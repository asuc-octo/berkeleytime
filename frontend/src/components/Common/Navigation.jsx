import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

class Navigation extends PureComponent {
  render() {
    const links = Navigation.links;
    const { banner } = this.props;

    return (
      <Navbar fixed="top" expand="lg" bg="white" className={`bt-navbar ${banner ? 'bt-navbar-dropped' : ''}`}>
        <Navbar.Brand as={Link} to="/">Berkeleytime</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto" />
          <Nav>
            {
              links.map(link => (
                <Nav.Link as={Link} to={link.to} key={link.text}>{link.text}</Nav.Link>
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
    text: 'Catalog',
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
    to: '/login',
    text: 'Login',
  },
];

const mapStateToProps = state => {
  const { banner } = state.banner;
  return {
    banner,
  }
}

export default connect(mapStateToProps)(Navigation);
