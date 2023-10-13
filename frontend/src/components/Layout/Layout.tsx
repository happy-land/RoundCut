import { block } from 'bem-cn';
import { Outlet } from 'react-router-dom';

const b = block('layout');

const Layout = () => {
  return (
    <>
      <main className={b()}>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
