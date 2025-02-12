import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
// import { useFetchUserQuery } from '../services/authApi';
// import { deleteCookie, getCookie } from '../utils/cookie';
import { logout, selectAuth, setUser } from '../features/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PriceList } from '../components/PriceList/PriceList';
import BilletPanel from '../components/BilletPanel/BilletPanel';
import WarehouseSelector from '../components/WarehouseSelector/WarehouseSelector';
import block from 'bem-cn';
import './Dashboard.scss';

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
    <>
      <h1 className={cnStyles('title')}>Dashboard</h1>
      {user && (
        <p className={cnStyles('user')}>
          Вы вошли как <Link to="/admin">{user.username}</Link>
        </p>
      )}
      <button onClick={handleLogout}>Logout</button>
      <WarehouseSelector />
      <BilletPanel />
      <PriceList type='user' />
    </>
  );
};

export default Dashboard;
