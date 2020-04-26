import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import { withRouter } from 'react-router';

class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.toggle = this.toggle.bind(this);
  }

  /**
   * Toggles collapsable navbar only when navbar collapses (under 992px)
   */
  toggle() {
    if (window.innerWidth < 992) {
      this.setState(prevState => ({ open: !prevState.open }));
    }
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
        <Navbar.Toggle aria-controls="responsive-navbar-nav" onClick={this.toggle} />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto" />
          <Nav>
            {
              links.map(link => {
                let currUrl = this.props.history.location.pathname;
                let to = currUrl.includes(link.to) ? currUrl : link.to;
                return (<Nav.Link as={Link} to={to} key={link.text} onClick={this.toggle}>
                  {link.text}
                </Nav.Link>)
              })
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

export default connect(mapStateToProps)(withRouter(Navigation));
