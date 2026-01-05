import Dashboard from "layouts/dashboard";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import CreateJob from "layouts/createJob";
import JobsHistory from "layouts/JobsHistory";
import PaymentsHistory from "layouts/PaymentsHistory";
// @mui icons
import Icon from "@mui/material/Icon";
import { clearAuthData } from "config/axiosConfig";
import { useNavigate } from "react-router-dom";
const LogoutItem = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthData(); // remove authToken, user, customerId
    navigate("/authentication/sign-in", { replace: true });
  };

  // Trigger logout immediately when this "component" renders
  handleLogout();
  return null; // no UI needed
};
const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Create Job",
    key: "create-job",
    icon: <Icon fontSize="small">add_circle</Icon>,
    route: "/create-job",
    component: <CreateJob />,
  },
  {
    type: "collapse",
    name: "Payments History",
    key: "Payments History",
    icon: <Icon fontSize="small">payment</Icon>,
    route: "/PaymentsHistory",
    component: <PaymentsHistory />,
  },
  // {
  //   type: "collapse",
  //   name: "RTL",
  //   key: "rtl",
  //   icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
  //   route: "/rtl",
  //   component: <RTL />,
  // },
  {
    type: "collapse",
    name: "Jobs History",
    key: "Jobs History",
    icon: <Icon fontSize="small">history</Icon>,
    route: "/JobsHistory",
    component: <JobsHistory />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "route",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "route",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
  {
    type: "collapse",
    name: "Logout",
    key: "logout",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "/logout", // route for logout
    component: <LogoutItem />, // triggers logout when route is visited
  },
];

export default routes;
