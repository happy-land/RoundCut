import { block } from 'bem-cn';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';

const b = block('layout');

const Layout = () => {
  return (
    <>
      <Header />
      <main className={b()}>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
