import React, { lazy, Suspense } from 'react';
import { Switch, Route, RouteProps, Redirect } from 'react-router-dom';
import BTLoader from 'components/Common/BTLoader';

import Landing from './views/Landing';
import Catalog from './views/Catalog/Catalog';
// import Dashboard from './views/Dashboard/Dashboard';
// import DesignApp from './views/Forms/DesignApp';
// import EngineeringApp from './views/Forms/EngineeringApp';
// import { Positions } from './views/Apply/DescriptionPages';
import Error from './views/Error/Error';

// const Grades = lazy(() => new Promise(() => {}));
const Grades = lazy(() => import('./views/Grades/Grades'));
const Enrollment = lazy(() => import('./views/Enrollment/Enrollment'));
const About = lazy(() => import('./views/About'));
const Releases = lazy(() => import('./views/Releases/Releases'));
const Faq = lazy(() => import('./views/Faq'));
const ApiDocs = lazy(() => import('./views/Api/Api'));
const TestForm = lazy(() => import('./views/Forms/TestForm'));
const BugsForm = lazy(() => import('./views/Forms/BugsForm'));
const Apply = lazy(() => import('./views/Apply/Apply'));
const Profile = lazy(() => import('./views/Profile/Profile'));
const Login = lazy(() => import('./views/Login/Login'));
const Logout = lazy(() => import('./views/Profile/Logout'));
// const Scheduler = lazy(() => import('./views/Scheduler/Scheduler'));
const PrivacyPolicy = lazy(() => import('./views/Policies/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./views/Policies/TermsOfService'));
const UserTestingForm = lazy(() => import('./views/Forms/UserTestingForm'));

const routes: Array<RouteProps> = [
  { path: '/landing', component: Landing },
  { path: '/catalog', component: Catalog, exact: false },
  { path: '/grades', component: Grades, exact: false },
  { path: '/enrollment', component: Enrollment, exact: false },
  { path: '/about', component: About },
  // { path: '/login',             component: Login           },
  { path: '/releases', component: Releases },
  { path: '/faq', component: Faq },
  { path: '/apidocs', component: ApiDocs },
  { path: '/testform', component: TestForm },
  { path: '/bugs', component: BugsForm },
  { path: '/usertesting', component: UserTestingForm },
  { path: '/apply', component: Apply },
  { path: '/profile', component: Profile },
  { path: '/oauth2callback', component: Login },
  { path: '/logout', component: Logout },
  // { path: '/scheduler', component: Scheduler },
  // { path: '/apply/positions',   component: Positions       },
  // { path: '/apply/engineering', component: EngineeringApp  },
  // { path: '/apply/design',      component: DesignApp       },
  // { path: '/apply/embed',       component: Apply           },
  { path: '/error', component: Error },
  { path: '/legal/privacy', component: PrivacyPolicy },
  { path: '/legal/terms', component: TermsOfService },
];

const Routes: React.FC = () => (
  <Suspense
    fallback={
      <div className="viewport-app">
        <BTLoader />
      </div>
    }
  >
    <Switch>
      <Redirect from="/" to="/landing" exact />
      {routes.map((route) => (
        <Route
          key={route.path as string}
          path={route.path}
          component={route.component}
          exact={route.exact ?? true} // force exact=true unless specified false
          sensitive
        />
      ))}
      {/* 404 page if nothing matches */}
      <Route component={Error} />
    </Switch>
  </Suspense>
);

export default Routes;
