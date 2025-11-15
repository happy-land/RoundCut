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
import DiameterSelector from '../components/DiameterSelector/DiameterSelector';

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
        <SearchFilter placeholder="Введите запрос, например: Круг" />
      </section>

      <section className={cnStyles('steelgrades-wrapper')}>
        <SteelGrades />
      </section>

      <section className={cnStyles('diameters-wrapper')}>
        <DiameterSelector />
      </section>

      <section className={cnStyles('pricelist-wrapper')}>
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
