import React, { FC, useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { Navbar, Nav, NavProps } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../redux/store';

import { useUser } from '../../graphql/hooks/user';
import LoginModal from '../Login/LoginModal';
import { Theme } from 'bt/types';
import { Themed } from 'bt/custom';

const NavigationLink: FC<
  {
    to?: string;
    onClick?: () => void;
  } & NavProps
> = ({ to, children, ...props }) => (
  <Nav.Link
    as={to ? Link : undefined}
    to={to}
    className="bt-bold"
    eventKey={to}
    {...props}
  // eventKey required for collapseOnselect
  // https://stackoverflow.com/questions/54859515/react-bootstrap-navbar-collapse-not-working/56485081#56485081
  >
    {children}
  </Nav.Link>
);

const Navigation: FC = () => {
  const banner = useSelector<ReduxState, boolean>(state => state.common.banner);
  const theme = useSelector<ReduxState, Theme>(state => state.common.theme);

  const [showLogin, setShowLogin] = useState(false);

  const [links, setLinks] = useState<
    {
      text: string;
      to?: string;
      nav_to?: string;
      onClick?: () => void;
    }[]
  >(
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
      // {
      //   to: '/scheduler',
      //   text: 'Scheduler',
      // },
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
    ].map((link) => ({
      to: link.to,
      text: link.text,
      nav_to: link.to,
    }))
  );

  const location = useLocation();
  const { isLoggedIn } = useUser();

  useEffect(() => {
    // Hide modal when path changes
    setShowLogin(false);

    setLinks((links) =>
      links.map((link) => ({
        to: link.to,
        text: link.text,
        // nav_to is either [link.to] or '' if we are already on that page
        nav_to: link.to && location.pathname.includes(link.to) ? '' : link.to,
      }))
    );
  }, [location.pathname]);

  return (
    <Navbar
      collapseOnSelect={true}
      fixed="top"
      expand="lg"
      variant={theme === 'dark' ? 'dark' : 'light'}
      style={banner ? { position: 'absolute' } : {}}
    /* when the banner is open, the navbar will be positioned
       at the top of the app-container instead of fixed to the
       top of the viewport */
    >
      <Navbar.Brand as={Link} to="/" className="bt-bold">
        <Themed light={<>{'Berkeleytime'}</>} stanfurd={<>{'Stanfurdtime'}</>} />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto" />
        <Nav>
          {links.map((link, index) => (
            <NavigationLink key={index} to={link.nav_to}>
              {link.text}
            </NavigationLink>
          ))}

          {isLoggedIn ? (
            <>
              <NavigationLink to="/profile">Profile</NavigationLink>
              <NavigationLink to="/logout">Log Out</NavigationLink>
            </>
          ) : (
            <NavigationLink onClick={() => setShowLogin(true)}>
              Login
            </NavigationLink>
          )}
        </Nav>
      </Navbar.Collapse>
      <LoginModal showLogin={showLogin} hideLogin={() => setShowLogin(false)} />
    </Navbar>
  );
};

export default Navigation;
