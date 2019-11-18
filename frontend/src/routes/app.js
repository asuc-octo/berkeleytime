import Landing from '../views/Landing/Landing.jsx';
import Catalog from '../views/Catalog/Catalog.jsx';
import Grades from '../views/Grades/Grades.jsx';
import Enrollment from '../views/Enrollment/Enrollment.jsx';
import About from '../views/About/About.jsx';
import Dashboard from '../views/Dashboard/Dashboard.jsx';
import Error from '../views/Error/Error.jsx';

const appRoutes = [
    { path: "/landing", name: "Home", icon: "", component: Landing },
    { path: "/catalog", name: "Catalog", icon:"", component: Catalog },
    { path: "/grades", name: "Grades", icon:"", component: Grades },
    { path: "/enrollment", name: "Enrollment", icon:"", component: Enrollment },
    { path: "/about", name: "About", icon: "", component: About},
    { path: "/dashboard", name: "Dashboard", icon: "pe-7s-graph", component: Dashboard },
    { path: "/error", name: "Error", icon: "", component: Error }, 
    { redirect: true, exact: true, path: '/', to: '/landing', name: 'Home' },
    { name: "404", icon: "", component: Error },
];

export default appRoutes;
