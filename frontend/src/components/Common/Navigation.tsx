import React, { FC, useState, useEffect } from 'react'
import { useLocation } from 'react-router'
import { Link } from 'react-router-dom'
import { Navbar, Nav } from 'react-bootstrap'
import { connect, ConnectedProps } from 'react-redux'

import { ReduxState } from '../../redux/store'

import LoginButton from '../Login/LoginButton'

interface Props extends PropsFromRedux {}

const Navigation: FC<Props> = (props) => {
  const [links, setLinks] = useState(
    [
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
      //   to: '/apply',
      //   text: 'Apply',
      // },
      // {
      //  to: '/login',
      //  text: 'Login',
      // },
    ].map(link => ({
      to: link.to,
      text: link.text,
      nav_to: link.to
    }))
  )

  let location = useLocation();

  useEffect(() => {
    setLinks(links.map(link => ({
      to: link.to,
      text: link.text,
      // nav_to is either [link.to] or '' if we are already on that page
      nav_to: location.pathname.includes(link.to) ? '' : link.to
    })))
  }, [location.pathname])

  return (
    <Navbar
      collapseOnSelect={true}
      fixed="top"
      expand="lg"
      bg="white"
      style={props.banner ? { position: 'absolute'} : {}}
      /* when the banner is open, the navbar will be positioned
         at the top of the app-container instead of fixed to the
         top of the viewport */
    >
      <Navbar.Brand as={Link} to="/" className="bt-bold">Standfurdtime</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto" />
        <Nav>
          {
            links.map((link, index) => {
              if (link.nav_to === '/login') {
                return (<LoginButton/>);
              }
              // return empty nav link if we are on the page referenced by the nav link
              if (link.nav_to !== '') {
                return (
                  <Nav.Link
                    key={link.text}
                    as={Link}
                    to={link.nav_to}
                    className="bt-bold"
                    eventKey={(index + 1).toString()}
                    // eventKey required for collapseOnselect
                    // https://stackoverflow.com/questions/54859515/react-bootstrap-navbar-collapse-not-working/56485081#56485081
                  >
                    {link.text}
                  </Nav.Link>
                )
              } else {
                return (
                  <Nav.Link
                    key={"currentPage"}
                    className="bt-bold"
                    eventKey={(index + 1).toString()}
                  >
                    {link.text}
                  </Nav.Link>
                )
              }
            })
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

const mapState = (state: ReduxState) => ({
  banner: state.common.banner
})

const connector = connect(mapState)

type PropsFromRedux = ConnectedProps<typeof connector>

export default connector(Navigation)
