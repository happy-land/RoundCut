import { FC, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { Page404 } from '../../pages/404/Page404';
import './App.scss';
import { useDispatch } from '../../hooks';
import { getCookie } from '../../utils/cookie';
import { getUserDataThunk } from '../../services/actions/user';
import { HomePage } from '../../pages/HomePage/HomePage';

const App: FC = () => {
  const dispatch = useDispatch();

  // проверим, есть ли accessToken
  const init = async () => {
    if (getCookie('accessToken')) {
      dispatch(getUserDataThunk());
    }
  }

  useEffect(() => {
    init();
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/1' element={<h1>1</h1>} />
        <Route path='/2' element={<h1>222</h1>} />
        <Route path='/' element={<HomePage />} />
      </Route>
      <Route path='*' element={<Page404 />} />
    </Routes>
  );
};

export default App;
