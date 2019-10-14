/* eslint-disable no-multi-spaces */
/* eslint-disable object-curly-newline */

import Landing from '../views/Landing/Landing';
import Catalog from '../views/Catalog/Catalog';
import Scheduler from '../views/Scheduler/Scheduler';
import Grades from '../views/Grades/Grades';
import Enrollment from '../views/Enrollment/Enrollment';
import About from '../views/About/About';
import Dashboard from '../views/Dashboard/Dashboard';
import Error from '../views/Error/Error';

// name should be unique, used as react key
const routes = [
  // redirect
  { path: '/', name: 'RedirectHome', redirect: true, exact: true, to: '/landing' },

  { path: '/landing',    name: 'Home',       component: Landing },
  { path: '/scheduler',  name: 'Scheduler',  component: Scheduler },
  { path: '/catalog',    name: 'Catalog',    component: Catalog },
  { path: '/grades',     name: 'Grades',     component: Grades },
  { path: '/enrollment', name: 'Enrollment', component: Enrollment },
  { path: '/about',      name: 'About',      component: About },
  { path: '/dashboard',  name: 'Dashboard',  component: Dashboard },
  { path: '/error',      name: 'Error',      component: Error },
  { /* no path */        name: '404',        component: Error },
];

export default routes;
