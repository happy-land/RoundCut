import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
// import { useFetchUserQuery } from '../services/authApi';
// import { deleteCookie, getCookie } from '../utils/cookie';
import { logout, selectAuth, setUser } from '../features/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PriceList } from '../components/PriceList/PriceList';
import BilletPanel from '../components/BilletPanel/BilletPanel';
import block from 'bem-cn';
import './Dashboard.scss';
import SearchFilter from '../components/SearchFilter/SearchFilter';
import SteelGrades from '../components/SteelGrades/SteelGrades';

const cnStyles = block('dashboard-container');

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('User logout');
    navigate('/auth');
  };

  return (
    <div className={cnStyles()}>
      <section className={cnStyles('search-filter')}>
        <SearchFilter placeholder='Круг Ст09Г2С' />
      </section>

      <section className={cnStyles('steelgrades-wrapper')}>
        <div className={cnStyles('steelgrades')}>
          <SteelGrades />
        </div>
        <div className={cnStyles('steelgrade-options')}></div>
      </section>

      <section className={cnStyles('diameters-wrapper')}>
        <div className={cnStyles('diameters')}>диаметры</div>
        <div className={cnStyles('diameter-options')}>настр</div>
      </section>

      <section className={cnStyles('price-list')}>
        <PriceList type="user" />
      </section>

      {user && (
        <p className={cnStyles('user')}>
          Вы вошли как <Link to="/admin">{user.username}</Link>
        </p>
      )}

      <button onClick={handleLogout}>Logout</button>
      <BilletPanel />
    </div>
  );
};

export default Dashboard;
