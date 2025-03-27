import { FC, useEffect } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Layout from '../Layout/Layout';
// import { Page404 } from '../../pages/404/Page404';
import './App.scss';
import { fetchItems } from '../../features/price/priceitemsSlice';
import { useAppDispatch } from '../../app/hooks';
import { getCookie } from '../../utils/cookie';
import { SigninPage } from '../../pages/SigninPage/SigninPage';
import Auth from '../../pages/Auth';
import Dashboard from '../../pages/Dashboard';
// import { ToastContainer } from 'react-toastify';
import { setUser } from '../../features/authSlice';
import { PriceItemDetails } from '../../pages/PriceItemDetails';
import AdminDashboard from '../../pages/Admin/AdminDashboard';
import AdminPrice from '../AdminPrice/AdminPrice';
import { Markup } from '../../pages/Markup';
import Warehouse from '../../pages/Warehouse';
import { Modal } from '../Modal/Modal';
import WarehouseDetails from '../WarehouseDetails/WarehouseDetails';
import Cut from '../../pages/Cut';
import CutitemEditPage from '../../pages/CutitemEditPage';
import CategoryEditPage from '../../pages/CategoryEditPage';
import ForgotPassword from '../../pages/ForgotPassword';
import ResetPassword from '../../pages/ResetPassword';
import WarehouseList from '../WarehouseList/WarehouseList';
import WarehouseSelectorModal from '../WarehouseSelectorModal/WarehouseSelectorModal';

const App: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); // useHistory deprecated

  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };

  console.log(state?.backgroundLocation);

  // const background = location.state && location.state.background;
  // console.log(`location:`);
  // console.log(location);
  // console.log(`background:`);
  // console.log(background);

  const user = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    // console.log('useEffect from App.tsx, ', user);
    dispatch(setUser(user));
    // записать наценки в стор
  }, []);

  const closeAllModals = () => {
    console.log('Закрыть модалку');
    navigate(-1);
  };

  return (
    <div>
      {/* <ToastContainer /> */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* <Route path="/warehouse-selector/:id" element={
            <Modal onClose={closeAllModals}>

            </Modal>
          } /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route path="/admin/price" element={<AdminPrice />} />
            <Route path="/admin/category" element={<CategoryEditPage />} />
            <Route path="/admin/warehouse" element={<Warehouse />} />
            <Route
              path="/admin/warehouse/:id"
              element={
                <Modal onClose={closeAllModals}>
                  <WarehouseDetails />
                </Modal>
              }
            ></Route>
            <Route path="/admin/markup" element={<Markup />} />
            <Route path="/admin/cut" element={<Cut />} />
            <Route path="/admin/cutitem" element={<CutitemEditPage />} />
          </Route>

          {/* <Route path="/price" element={<PriceList />} /> */}
          <Route path="/price/:id" element={<PriceItemDetails />} />
          {/* <Route path="/users/:id" element={<SinglePriceitemPage />} /> */}
          {/* <Route path="/" element={<HomePage />} /> */}
          {/* <Route path="/signin" element={<SigninPage />} /> */}
          {/* <Route path="/price" element={<PricePage />} /> */}
          {/* <Route path="/loadcsv" element={<LoadCSV />} /> */}
        </Route>
        {/* <Route path="*" element={<Page404 />} /> */}
      </Routes>

      {state?.backgroundLocation && (
        <Routes>
          <Route
            path="/select-warehouse"
            element={
              <Modal onClose={closeAllModals}>
                <WarehouseSelectorModal />
              </Modal>
            }
          />
        </Routes>
      )}
    </div>
  );
};

export default App;
