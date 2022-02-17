/*eslint max-len: ["error", { "code": 180 }]*/
import React, { lazy, Suspense } from 'react';
import { Switch, Route, RouteProps, Redirect } from 'react-router-dom';
import BTLoader from 'components/Common/BTLoader';

import Landing from './views/Landing';
import Catalog from './views/Catalog/Catalog';
import Error from './views/Error/Error';
// const Grades = lazy(() => new Promise(() => {}));
// import DesignApp from './views/Forms/DesignApp';
// import EngineeringApp from './views/Forms/EngineeringApp';
// import { Positions } from './views/Apply/DescriptionPages';
// const ApiDocs = lazy(() => import('./views/Api/Api'));

const Grades = lazy(() => import('./views/Grades/Grades'));
const Enrollment = lazy(() => import('./views/Enrollment/Enrollment'));
const About = lazy(() => import('./views/About'));
const Releases = lazy(() => import('./views/Releases/Releases'));
const Faq = lazy(() => import('./views/Faq'));
const TestForm = lazy(() => import('./views/Forms/TestForm'));
const BugsForm = lazy(() => import('./views/Forms/BugsForm'));
const Apply = lazy(() => import('./views/Apply/Apply'));
const Profile = lazy(() => import('./views/Profile/Profile'));
const Login = lazy(() => import('./views/Login/Login'));
const Logout = lazy(() => import('./views/Profile/Logout'));
const SchedulerOnboard = lazy(() => import('./views/Scheduler/SchedulerOnboard'));
const LocalScheduler = lazy(() => import('./views/Scheduler/LocalSchedulerPage'));
const RemoteScheduler = lazy(() => import('./views/Scheduler/RemoteSchedulerPage'));
const ViewSchedule = lazy(() => import('./views/Scheduler/ViewSchedule'));
const PrivacyPolicy = lazy(() => import('./views/Policies/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./views/Policies/TermsOfService'));
const UserTestingForm = lazy(() => import('./views/Forms/UserTestingForm'));
const RedirectLink = lazy(() => import('./views/RedirectLink'));

const routes: Array<RouteProps> = [
  { path: '/landing', component: Landing },
  { path: '/catalog', component: Catalog, exact: false },
  { path: '/grades', component: Grades, exact: false },
  { path: '/enrollment', component: Enrollment, exact: false },
  { path: '/about', component: About },
  { path: '/releases', component: Releases },
  { path: '/faq', component: Faq },
  { path: '/testform', component: TestForm },
  { path: '/bugs', component: BugsForm },
  { path: '/usertesting', component: UserTestingForm },
  { path: '/apply', component: Apply },
  { path: '/profile', component: Profile },
  { path: '/oauth2callback', component: Login },
  { path: '/logout', component: Logout },
  { path: '/scheduler', component: SchedulerOnboard },
  { path: '/scheduler/new', component: LocalScheduler },
  { path: '/scheduler/:scheduleId', component: RemoteScheduler },
  { path: '/schedule/:scheduleId', component: ViewSchedule },
  // { path: '/apply/positions',   component: Positions       },
  // { path: '/apply/engineering', component: EngineeringApp  },
  // { path: '/apply/design',      component: DesignApp       },
  // { path: '/apply/embed',       component: Apply           },
  // { path: '/scheduler', component: Scheduler },
  { path: '/error', component: Error },
  { path: '/legal/privacy', component: PrivacyPolicy },
  { path: '/legal/terms', component: TermsOfService },
  { path: '/redirect', component: RedirectLink, exact: false },
];

const Routes: React.FC = () => (
  <Suspense
    fallback={
      <div className="viewport-app">
        <BTLoader fill />
      </div>
    }
  >
    <Switch>
      <Redirect from="/" to="/landing" exact />
      <Redirect from="/s/:scheduleId" to="/schedule/:scheduleId" />
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
