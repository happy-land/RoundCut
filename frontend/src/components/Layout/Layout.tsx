import { block } from 'bem-cn';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import Toast from '../Toast/Toast';
import './Layout.scss';

const b = block('layout');

const Layout = () => {
  return (
    <div className={b('wrapper')}>
      <Header />
      <main className={b()}>
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
};

export default Layout;
