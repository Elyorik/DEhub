import { createBrowserRouter } from 'react-router-dom';
import Layout from '../layout/Layout';
import Home from '../pages/Home/Home';

export const routers = createBrowserRouter([
  {
    element: <Layout />,

    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
]);
