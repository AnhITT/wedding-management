import { lazy } from "react";
import { Navigate } from "react-router-dom";

/****Layouts*****/
const FullLayout = lazy(() => import("../layouts/FullLayout.js"));

/***** Pages ****/
const Starter = lazy(() => import("../views/Starter.js"));
const Accounts = lazy(() => import("../views/ui/Accounts.js"));
const Branches = lazy(() => import("../views/ui/Branchs.js"));
const Halls = lazy(() => import("../views/ui/Halls.js"));
const MenuCategories = lazy(() => import("../views/ui/MenuCategories.js"));
const Menus = lazy(() => import("../views/ui/Menus.js"));
const ServiceCategories = lazy(() =>
    import("../views/ui/ServiceCategories.js")
);
const Services = lazy(() => import("../views/ui/Services.js"));
const Invoices = lazy(() => import("../views/ui/Invoices.js"));
const Feedbacks = lazy(() => import("../views/ui/Feedbacks.js"));
const Login = lazy(() => import("../views/ui/Login.js"));

const ThemeRoutes = [
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/",
        element: <FullLayout />,
        children: [
            { path: "/", element: <Starter /> },
            { path: "/accounts", element: <Accounts /> },
            { path: "/branches", element: <Branches /> },
            { path: "/halls", element: <Halls /> },
            { path: "/menu-categories", element: <MenuCategories /> },
            { path: "/menus", element: <Menus /> },
            { path: "/service-categories", element: <ServiceCategories /> },
            { path: "/services", element: <Services /> },
            { path: "/invoices", element: <Invoices /> },
            { path: "/feedbacks", element: <Feedbacks /> },
        ],
    },
];

export default ThemeRoutes;
