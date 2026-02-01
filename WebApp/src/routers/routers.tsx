import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layout/Layout';
import Home from '../pages/Home/Home';
import Suchen from '../pages/Suchen/Suchen';
import Neuigkeiten from '../pages/Neuigkeiten/Neuigkeiten';
import KI from '../pages/KI/KI';
import Überuns from '../pages/Überuns/Überuns';
import Account from "../pages/Account/Account";
import Quellen from "../pages/Quellen/Quellen";
import Forum from "../pages/Forum/Forum";
import Spiele from "../pages/Spiele/Spiele";
import TutorHub from "../pages/Tutorhub/Tutorhub";
import StudentProfile from "../pages/Tutorhub/StudentProfile";
import NotFound from "../pages/NotFound/NotFound";

export const routers = createBrowserRouter([
  {
    element: <Layout />,

    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "suchen",
        element: <Suchen />,
      },
      {
        path: "neuigkeiten",
        element: <Neuigkeiten />,
      },
      {
        path: "ki",
        element: <KI />,
      },
      {
        path: "uber-uns",
        element: <Überuns />,
      },
      {
        path: "account",
        element: <Account />,
      },
      {
        path: "quellen",
        element: <Quellen />,
      },
      { path: "tutorhub",
        element: <TutorHub />, 
      },
      { path: "tutorhub/user/:userId",
        element: <TutorHub />, 
      },
      { path: "student/:id",
        element: <StudentProfile />,
      },
      {
        path: "forum",
        element: <Forum />,
      },
      {
        path: "spiele",
        element: <Spiele />,
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
