import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layout/Layout';
import Home from '../pages/Home/Home';
import Suchen from '../pages/Suchen/Suchen';
import Neuigkeiten from '../pages/Neuigkeiten/Neuigkeiten';
import KIWerkzeuge from '../pages/KIWerkzeuge/KIWerkzeuge';
import Überuns from '../pages/Überuns/Überuns';

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
        element: <Suchen   />,
      },
      {
        path: "neuigkeiten",
        element: <Neuigkeiten />,
      },
      {
        path: "ki-werkzeuge",
        element: <KIWerkzeuge />,
      },
      {
        path: "uber-uns",
        element: <Überuns />,
      },
    ],
  },
]);
