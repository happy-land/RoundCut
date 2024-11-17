import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import block from 'bem-cn';
import './AdminDashboard.scss';

type Props = {};

const cnStyles = block('admin-dashboard');

const AdminDashboard = (props: Props) => {
  return (
    <div className={cnStyles()}>
      <h1>AdminDashboard</h1>
      <NavLink to="/dashboard">Назад</NavLink>
      <nav className={cnStyles('nav-menu')}>
        <NavLink className={cnStyles('link')} to="/admin/price">
          Прайс
        </NavLink>
        <NavLink className={cnStyles('link')} to="/admin/warehouse">
          Склады
        </NavLink>
        <NavLink className={cnStyles('link')} to="/admin/markup">
          Наценки
        </NavLink>
        <NavLink className={cnStyles('link')} to="/admin/cut">
          Каталог резки
        </NavLink>
        <NavLink className={cnStyles('link')} to="/admin/cutitem">
          Резка (редактирование)
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
};

export default AdminDashboard;
