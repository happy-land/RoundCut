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
import { useAppDispatch } from '../../app/hooks';
import Auth from '../../pages/Auth';
import Dashboard from '../../pages/Dashboard';
import { setUser } from '../../features/authSlice';
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
import WarehousePickerModal from '../WarehousePickerModal/WarehousePickerModal';
import OptionsPickerModal from '../OptionsPickerModal/OptionsPickerModal';
import BilletModal from '../BilletModal/BilletModal';
import CartPage from '../../pages/CartPage';
import OrdersPage from '../../pages/OrdersPage';
import ProfilePage from '../../pages/ProfilePage';

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
    const modalPaths = ['/select-options', '/select-warehouse'];
    if (modalPaths.includes(location.pathname)) {
      navigate('/dashboard');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="app-root">
      {/* <ToastContainer /> */}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* <Route path="/warehouse-selector/:id" element={
            <Modal onClose={closeAllModals}>
            </Modal>
          } /> */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
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
            />
            <Route path="/admin/markup" element={<Markup />} />
            <Route path="/admin/cut" element={<Cut />} />
            <Route path="/admin/cutitem" element={<CutitemEditPage />} />
          </Route>
          {/* <Route path="/price" element={<PriceList />} /> */}
          {/* <Route path="/price/:id" element={<PriceItemDetails />} /> */}
          {/* <Route path="/users/:id" element={<SinglePriceitemPage />} /> */}
          {/* <Route path="/" element={<HomePage />} /> */}
          {/* <Route path="/signin" element={<SigninPage />} /> */}
          {/* <Route path="/price" element={<PricePage />} /> */}
          {/* <Route path="/loadcsv" element={<LoadCSV />} /> */}
        </Route>
        {/* Add direct routes for modals so they work without backgroundLocation */}
        <Route
          path="/select-warehouse"
          element={
            <Modal onClose={closeAllModals}>
              <WarehousePickerModal />
            </Modal>
          }
        />
        <Route
          path="/select-options"
          element={
            <Modal onClose={closeAllModals}>
              <OptionsPickerModal />
            </Modal>
          }
        />
        <Route
          path="/price/:id"
          element={
            <Modal onClose={closeAllModals}>
              <BilletModal />
            </Modal>
          }
        />
        {/* <Route path="*" element={<Page404 />} /> */}
      </Routes>

      {state?.backgroundLocation && (
        <Routes>
          <Route
            path="/select-warehouse"
            element={
              <Modal onClose={closeAllModals}>
                <WarehousePickerModal />
              </Modal>
            }
          />
          <Route
            path="/select-options"
            element={
              <Modal onClose={closeAllModals}>
                <OptionsPickerModal />
              </Modal>
            }
          />
          <Route
          path="/price/:id"
          element={
            <Modal onClose={closeAllModals}>
              <BilletModal />
            </Modal>
          }
        />
        </Routes>
      )}
    </div>
  );
}

export default App;