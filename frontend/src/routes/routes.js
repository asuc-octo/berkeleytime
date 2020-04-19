/* eslint-disable no-multi-spaces */
/* eslint-disable object-curly-newline */

import Landing from '../views/Landing/Landing';
import Catalog from '../views/Catalog/Catalog';
import Grades from '../views/Grades/Grades';
import Enrollment from '../views/Enrollment/Enrollment';
import About from '../views/About/About';
import Dashboard from '../views/Dashboard/Dashboard';
import Login from '../views/Login/Login';
import Releases from '../views/Releases/Releases';
import Faq from '../views/Faq/Faq';
import ApiDocs from '../views/Api/Api';
import Join from '../views/Join/Join';
import Error from '../views/Error/Error';

// name should be unique, used as react key
const routes = [
  // redirect
  { path: '/', name: 'RedirectHome', redirect: true, exact: true, to: '/landing' },

  { path: '/landing',    name: 'Home',       component: Landing },
  { path: '/catalog',    name: 'Catalog',    component: Catalog },
  { path: '/grades',     name: 'Grades',     component: Grades },
  { path: '/enrollment', name: 'Enrollment', component: Enrollment },
  { path: '/about',      name: 'About',      component: About },
  { path: '/dashboard',  name: 'Dashboard',  component: Dashboard },
  { path: '/login',      name: 'Login',      component: Login },
  { path: '/releases',   name: 'Releases',   component: Releases },
  { path: '/faq',        name: 'Faq',        component: Faq },
  { path: '/apidocs',    name: 'Api Docs',   component: ApiDocs },
  { path: '/join',       name: 'Join',       component: Join },
  { path: '/error',      name: 'Error',      component: Error },
  { /* no path */        name: '404',        component: Error },
];

export default routes;
