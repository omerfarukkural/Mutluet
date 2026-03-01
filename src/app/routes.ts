import { createBrowserRouter } from "react-router";
import { Onboarding } from "./components/onboarding";
import { Login } from "./components/login";
import { Home } from "./components/home";
import { Events } from "./components/events";
import { Donate } from "./components/donate";
import { Profile } from "./components/profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Onboarding,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/home",
    Component: Home,
  },
  {
    path: "/events",
    Component: Events,
  },
  {
    path: "/donate",
    Component: Donate,
  },
  {
    path: "/profile",
    Component: Profile,
  },
]);
