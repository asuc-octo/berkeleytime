import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

class Navigation extends PureComponent {


  render() {
    const links = Navigation.links;

    return (
      <Navbar fixed="top" expand="lg" bg="white" className="bt-navbar">
        <Navbar.Brand as={Link} to="/">BerkeleyTime</Navbar.Brand>
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
    to: '/faq',
    text: 'FAQ',
  },
  {
    to: '/login',
    text: 'Login',
  },
];

export default Navigation;
