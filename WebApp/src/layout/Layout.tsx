import { Outlet } from 'react-router-dom';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import Container from '../components/ui/Container/Container';

function Layout() {
  return (
    <Container className="layout-wrapper">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </Container>
  );
}

export default Layout;