import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import AddStory from "../pages/addstory/addStory-page";
import RegisterPage from "../pages/auth/register/register-page";
import LoginPage from "../pages/auth/login/login-page";
import ReadMorePage from "../pages/readMore/readMore-page";
import storyMarkPage from "../pages/storymark/storyMark-page";

const routes = {
  "/": new HomePage(),
  "/home": new HomePage(),
  "/storyMark": new storyMarkPage(),
  "/about": new AboutPage(),
  "/addStory": new AddStory(),
  "/register": new RegisterPage(),
  "/login": new LoginPage(),
  "/readMore/:id": new ReadMorePage(),
};

export default routes;
