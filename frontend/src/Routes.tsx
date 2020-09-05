import React from 'react';
import { Switch, Route, RouteProps, Redirect } from 'react-router-dom'

import Landing from './views/Landing/Landing';
import Catalog from './views/Catalog/Catalog';
import Grades from './views/Grades/Grades';
import Enrollment from './views/Enrollment/Enrollment';
import About from './views/About/About';
import Dashboard from './views/Dashboard/Dashboard';
import Login from './views/Login/Login';
import Releases from './views/Releases/Releases';
import Faq from './views/Faq/Faq';
import ApiDocs from './views/Api/Api';
import Apply from './views/Apply/Apply';
import TestForm from './views/Forms/TestForm';
import BugsForm from './views/Forms/BugsForm';
import DesignApp from './views/Forms/DesignApp';
import EngineeringApp from './views/Forms/EngineeringApp';
import UserTestingForm from './views/Forms/UserTestingForm';
import Error from './views/Error/Error';
import { Positions } from './views/Apply/DescriptionPages';

const routes: Array<RouteProps & { nonexact?: boolean }> = [
  { path: '/landing',           component: Landing         },
  { path: '/catalog',           component: Catalog,        nonexact: true },
  { path: '/grades',            component: Grades,         nonexact: true },
  { path: '/enrollment',        component: Enrollment,     nonexact: true },
  { path: '/about',             component: About           },
  { path: '/dashboard',         component: Dashboard       },
  { path: '/login',             component: Login           },
  { path: '/releases',          component: Releases        },
  { path: '/faq',               component: Faq             },
  { path: '/apidocs',           component: ApiDocs         },
  { path: '/testform',          component: TestForm        },
  { path: '/bugs',              component: BugsForm        },
  { path: '/usertesting',       component: UserTestingForm },
  { path: '/apply',             component: Apply           },
  { path: '/apply/positions',   component: Positions       },
  { path: '/apply/engineering', component: EngineeringApp  },
  { path: '/apply/design',      component: DesignApp       },
  { path: '/apply/embed',       component: Apply           },
  { path: '/error',             component: Error           },
]

const Routes: React.FC = () => (
  <Switch>
    <Redirect from="/" to="/landing" exact />
    {
      routes.map(route => (
        <Route
          path={route.path}
          component={route.component}
          exact={!route.nonexact} // force exact=true unless specified false
          sensitive 
        />
      ))
    }
    <Route component={Error} /> // 404 page if nothing matches
  </Switch>
)

export default Routes