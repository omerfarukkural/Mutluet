import { createBrowserRouter } from "react-router";
import { Onboarding } from "./components/onboarding";
import { Login } from "./components/login";
import { Home } from "./components/home";
import { Events } from "./components/events";
import { Donate } from "./components/donate";
import { Profile } from "./components/profile";
import { Categories } from "./components/categories";
import { Map } from "./components/map";
import { Chat } from "./components/chat";
import { Matching } from "./components/matching";
import { Psychosocial } from "./components/psychosocial";
import { Institutions } from "./components/institutions";
import { Games } from "./components/games";
import { BalloonGame } from "./components/balloon-game";
import { VideoCall } from "./components/video-call";
import { OkeyGame } from "./components/okey-game";

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
    path: "/categories",
    Component: Categories,
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
    path: "/map",
    Component: Map,
  },
  {
    path: "/chat",
    Component: Chat,
  },
  {
    path: "/matching",
    Component: Matching,
  },
  {
    path: "/psychosocial",
    Component: Psychosocial,
  },
  {
    path: "/institutions",
    Component: Institutions,
  },
  {
    path: "/games",
    Component: Games,
  },
  {
    path: "/balloon-game",
    Component: BalloonGame,
  },
  {
    path: "/okey-game",
    Component: OkeyGame,
  },
  {
    path: "/video-call",
    Component: VideoCall,
  },
  {
    path: "/profile",
    Component: Profile,
  },
]);