/*eslint max-len: ["error", { "code": 180 }]*/
import { lazy, Suspense } from 'react';
import { Switch, Route, RouteProps, Redirect } from 'react-router-dom';
import BTLoader from 'components/Common/BTLoader';

import Catalog from './app/Catalog';
import Landing from './views/Landing';
import Error from './views/Error/Error';
import Layout from 'components/Common/Layout';

const Grades = lazy(() => import('./views/Grades/Grades'));
const Enrollment = lazy(() => import('./views/Enrollment/Enrollment'));
const About = lazy(() => import('./views/About'));
const Releases = lazy(() => import('./views/Releases/Releases'));
const Faq = lazy(() => import('./views/Faq'));
const Profile = lazy(() => import('./views/Profile/Profile'));
const Login = lazy(() => import('./views/Login/Login'));
const Logout = lazy(() => import('./views/Profile/Logout'));
const SchedulerOnboard = lazy(() => import('./views/Scheduler/SchedulerOnboard'));
const LocalScheduler = lazy(() => import('./views/Scheduler/LocalSchedulerPage'));
const RemoteScheduler = lazy(() => import('./views/Scheduler/RemoteSchedulerPage'));
const ViewSchedule = lazy(() => import('./views/Scheduler/ViewSchedule'));
const PrivacyPolicy = lazy(() => import('./views/Policies/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./views/Policies/TermsOfService'));
const RedirectLink = lazy(() => import('./views/RedirectLink'));
const Apply = lazy(() => import('./views/Apply'));

const routes: Array<RouteProps> = [
	{ path: '/landing', component: Landing },
	{ path: '/catalog', component: Catalog, exact: false },
	{ path: '/grades', component: Grades, exact: false },
	{ path: '/enrollment', component: Enrollment, exact: false },
	{ path: '/about', component: About },
	{ path: '/releases', component: Releases },
	{ path: '/faq', component: Faq },
	{ path: '/profile', component: Profile },
	{ path: '/oauth2callback', component: Login },
	{ path: '/logout', component: Logout },
	{ path: '/scheduler', component: SchedulerOnboard },
	{ path: '/scheduler/new', component: LocalScheduler },
	{ path: '/scheduler/:scheduleId', component: RemoteScheduler },
	{ path: '/schedule/:scheduleId', component: ViewSchedule },
	{ path: '/error', component: Error },
	{ path: '/legal/privacy', component: PrivacyPolicy },
	{ path: '/legal/terms', component: TermsOfService },
	{ path: '/redirect', component: RedirectLink, exact: false },
	{ path: '/apply', component: Apply },
];

const Routes = () => (
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

			<Route path="/catalog/:semester?/:abbreviation?/:courseNumber?" exact={false}>
				<Layout noFooter>
					<Catalog />
				</Layout>
			</Route>

			<Route>
				<Layout>
					<Switch>
						{routes.map((route) => (
							<Route
								key={route.path as string}
								path={route.path}
								component={route.component}
								exact={route.exact ?? true} // force exact=true unless specified false
								sensitive
							/>
						))}
						<Route component={Error} />
					</Switch>
				</Layout>
			</Route>

			<Route component={Error} />
		</Switch>
	</Suspense>
);

export default Routes;
