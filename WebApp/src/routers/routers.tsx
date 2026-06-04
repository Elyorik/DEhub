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
import DEBlick from "../pages/DEBlick/DEBlick";
import StudentProfile from "../pages/DEBlick/StudentProfile";
import Schule60 from "../Schule60/Schule60";
import NotFound from "../pages/NotFound/NotFound";
import Tutorhub from '../pages/Tutorhub/Tutorhub';
import TutorhubProtected from '../pages/Tutorhub/components/TutorhubProtected';
import TutorhubMain from '../pages/Tutorhub/pages/TutorhubMain';
import StudentProfileSetup from '../pages/Tutorhub/pages/StudentProfileSetup';
import TeacherProfileSetup from '../pages/Tutorhub/pages/TeacherProfileSetup';
import TeachersList from '../pages/Tutorhub/pages/TeachersList';
import TeacherDetails from '../pages/Tutorhub/pages/TeacherDetails';
import Wallet from '../pages/Tutorhub/pages/Wallet';
import Bookings from '../pages/Tutorhub/pages/Bookings';
import TutorhubAdminProtected from '../pages/Tutorhub/components/TutorhubAdminProtected';
import AdminDashboard from '../pages/Tutorhub/pages/AdminDashboard';


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
        path: "schule60",
        element: <Schule60 />,
      },
      {
        path: "übersetzer",
        element: <NotFound />,
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
      {
        path: "Tutorhub",
        element: <Tutorhub />,
      },
      {
  path: "Tutorhub/main",
  element: (
    <TutorhubProtected>
      <TutorhubMain />
    </TutorhubProtected>
  ),
},
{
  path: "Tutorhub/student-setup",
  element: (
    <TutorhubProtected>
      <StudentProfileSetup />
    </TutorhubProtected>
  ),
},
{
  path: "Tutorhub/teacher-setup",
  element: (
    <TutorhubProtected>
      <TeacherProfileSetup />
    </TutorhubProtected>
  ),
},
{
  path: "Tutorhub/teachers",
  element: (
    <TutorhubProtected>
      <TeachersList />
    </TutorhubProtected>
  ),
},
{
  path: "Tutorhub/teachers/:id",
  element: (
    <TutorhubProtected>
      <TeacherDetails />
    </TutorhubProtected>
  ),
},
{
  path: "Tutorhub/wallet",
  element: (
    <TutorhubProtected>
      <Wallet />
    </TutorhubProtected>
  ),
},
{
  path: "Tutorhub/bookings",
  element: (
    <TutorhubProtected>
      <Bookings />
    </TutorhubProtected>
  ),
},
{
  path: "Tutorhub/admin",
  element: (
    <TutorhubAdminProtected>
      <AdminDashboard />
    </TutorhubAdminProtected>
  ),
},
      { path: "DEBlick",
        element: <DEBlick />, 
      },
      { path: "DEBlick/user/:userId",
        element: <DEBlick />, 
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
