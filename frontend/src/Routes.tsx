import { createBrowserRouter, Navigate, RouterProvider, useParams } from 'react-router-dom';

import Catalog from './app/Catalog';
import Landing from './views/Landing';
import Error from './views/Error';
import Layout from './components/Common/Layout';

const Grades = () => import('./app/Grades');
const Enrollment = () => import('./app/Enrollment');
const About = () => import('./views/About');
const Releases = () => import('./views/Releases');
const Faq = () => import('./views/Faq');
const Profile = () => import('./views/Profile');
const Login = () => import('./views/Login');
const Logout = () => import('./views/Logout');
const SchedulerOnboard = () => import('./app/Scheduler/SchedulerOnboard');
const LocalScheduler = () => import('./app/Scheduler/LocalSchedulerPage');
const RemoteScheduler = () => import('./app/Scheduler/RemoteSchedulerPage');
const ViewSchedule = () => import('./app/Scheduler/ViewSchedule');
const PrivacyPolicy = () => import('./views/PrivacyPolicy');
const TermsOfService = () => import('./views/TermsOfService');
const RedirectLink = () => import('./views/RedirectLink');
// const Apply = () => import('./views/Apply');
// const InfoSesh = () => import('./views/InfoSesh');
// const Chats = () => import('./views/Chats');

function ScheduleRedirect() {
	const { scheduleId } = useParams();
	return <Navigate to={`/schedule/${scheduleId}`} replace />;
}

const router = createBrowserRouter([
	{
		element: <Layout />,
		ErrorBoundary: Error,
		children: [
			{ path: '/', index: true, Component: Landing },
			{ path: '/landing', element: <Navigate to="/" replace /> },
			{ path: '/s/:scheduleId', Component: ScheduleRedirect },
			{ path: '/grades/*', lazy: Grades },
			{ path: '/enrollment/*', lazy: Enrollment },
			{ path: '/about', lazy: About },
			{ path: '/releases', lazy: Releases },
			{ path: '/faq', lazy: Faq },
			{ path: '/profile', lazy: Profile },
			{ path: '/oauth2callback', lazy: Login },
			{ path: '/logout', lazy: Logout },
			{ path: '/scheduler', lazy: SchedulerOnboard },
			{ path: '/scheduler/:scheduleId', lazy: RemoteScheduler },
			{ path: '/schedule/:scheduleId', lazy: ViewSchedule },
			{ path: '/error', Component: Error },
			{ path: '/legal/privacy', lazy: PrivacyPolicy },
			{ path: '/legal/terms', lazy: TermsOfService },
			{ path: '/redirect', lazy: RedirectLink },
			{
				path: '/survey',
				loader: () => {
					window.location.href = 'https://berkeley.qualtrics.com/jfe/form/SV_0rDr0SJfMuPZvRs';

					return null;
				}
			}
			// { path: '/apply', lazy: Apply },
			// { path: '/infosesh', lazy: InfoSesh },
			// { path: '/chats', lazy: Chats },
		]
	},
	{
		element: <Layout footer={false} />,
		ErrorBoundary: Error,
		children: [
			{ path: '/catalog/:semester?/:abbreviation?/:courseNumber?', Component: Catalog },
			{ path: '/scheduler/new', lazy: LocalScheduler }
		]
	}
]);

export default function Routes() {
	return <RouterProvider router={router} />;
}
