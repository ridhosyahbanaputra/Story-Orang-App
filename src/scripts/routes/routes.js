import HomePage from "../pages/home/home-page";
import AddStory from "../pages/addStory/addStory-page";
import RegisterPage from "../pages/auth/register/register-page";
import LoginPage from "../pages/auth/login/login-page";
import ReadMorePage from "../pages/readMore/readMore-page";
import storyMarkPage from "../pages/storymark/storyMark";

const routes = {
  "/": new HomePage(),
  "/home": new HomePage(),
  "/storyMark": new storyMarkPage(),
  "/addStory": new AddStory(),
  "/register": new RegisterPage(),
  "/login": new LoginPage(),
  "/readMore/:id": new ReadMorePage(),
};

export default routes;
