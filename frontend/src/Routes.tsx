import React from 'react';
import { Switch, Route, RouteProps, Redirect } from 'react-router-dom'

import Landing from './views/Landing';
import Catalog from './views/Catalog/Catalog';
import Grades from './views/Grades/Grades';
import Enrollment from './views/Enrollment/Enrollment';
import About from './views/About';
import Dashboard from './views/Dashboard/Dashboard';
import Releases from './views/Releases/Releases';
import Faq from './views/Faq';
import ApiDocs from './views/Api/Api';
import Apply from './views/Apply/Apply';
import TestForm from './views/Forms/TestForm';
import BugsForm from './views/Forms/BugsForm';
// import DesignApp from './views/Forms/DesignApp';
// import EngineeringApp from './views/Forms/EngineeringApp';
// import { Positions } from './views/Apply/DescriptionPages';
import UserTestingForm from './views/Forms/UserTestingForm';
import Error from './views/Error/Error';
import Profile from './views/Profile/Profile';
import { PrivacyPolicy, TermsOfService } from './views/Policies';

const routes: Array<RouteProps> = [
  { path: '/landing',           component: Landing         },
  { path: '/catalog',           component: Catalog,        exact: false },
  { path: '/grades',            component: Grades,         exact: false },
  { path: '/enrollment',        component: Enrollment,     exact: false },
  { path: '/about',             component: About           },
  { path: '/dashboard',         component: Dashboard       },
  // { path: '/login',             component: Login           },
  { path: '/releases',          component: Releases        },
  { path: '/faq',               component: Faq             },
  { path: '/apidocs',           component: ApiDocs         },
  { path: '/testform',          component: TestForm        },
  { path: '/bugs',              component: BugsForm        },
  { path: '/usertesting',       component: UserTestingForm },
  { path: '/apply',             component: Apply           },
  { path: '/profile',           component: Profile         },
  // { path: '/apply/positions',   component: Positions       },
  // { path: '/apply/engineering', component: EngineeringApp  },
  // { path: '/apply/design',      component: DesignApp       },
  // { path: '/apply/embed',       component: Apply           },
  { path: '/error',             component: Error           },
  { path: '/legal/privacy',    component: PrivacyPolicy      },
  { path: '/legal/terms',      component: TermsOfService     },
]

const Routes: React.FC = () => (
  <Switch>
    <Redirect from="/" to="/landing" exact />
    {
      routes.map(route => (
        <Route
          key={route.path as string}
          path={route.path}
          component={route.component}
          exact={route.exact ?? true} // force exact=true unless specified false
          sensitive
        />
      ))
    }
    <Route component={Error} /> // 404 page if nothing matches
  </Switch>
)

export default Routes
