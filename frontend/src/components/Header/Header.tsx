import { FC, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from '../../hooks/index';
import block from 'bem-cn';
// import Burger from '../../images/icons/24/burger_menu.svg?react';
import './Header.scss';
import { useGetOwnUserQuery, useSigninMutation } from '../../features/api/apiSlice';
import { TAuthData } from '../../utils/types';
import { setCookie } from '../../utils/cookie';
import MenuIcon from '../../images/react-icons/hi/HiOutlineMenu.svg';
import UserIcon from '../../images/react-icons/hi/HiOutlineUser.svg';
import WarehouseSelectorV2 from '../WarehouseSelectorV2/WarehouseSelectorV2';

const cnStyles = block('header');

const Header: FC = () => {
  // const { isAuth, username } = useSelector((store) => store.user);

  const [accessToken, setAccessToken] = useState();

  // const [signin, { data: authResponse = '', isLoading, isSuccess }] = useSigninMutation();
  // const { data: userDataResponse, isLoading: isUserLoading, isSuccess: isUserSuccess } = useGetOwnUserQuery('');

  // let authRes: TAuthData;

  // if (isLoading) {
  //   console.log('loading user...');
  // } else if (isSuccess) {
  //   console.log(authResponse);
  //   authRes = authResponse;
  //   console.log(authRes.access_token);
  //   setCookie('accessToken', authRes.access_token);
  // }

  // if (isUserLoading) {
  //   console.log('isUserLoading');
  // } else if (isUserSuccess) {
  //   console.log('isUserSuccess');
  //   console.log(userDataResponse.username);
  // }


  // const [loginLink, setLoginLink] = useState<string>('Личный кабинет');

  // const isAuth = false;

  // const handleLogin = async (event: React.MouseEvent<HTMLButtonElement>) => {
  //   event.preventDefault();
  //   console.log('login');
  //   try {
  //     await signin({}).unwrap();
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  return (
    <header className={cnStyles()}>
      <div className={cnStyles('wrapper')}>
        <NavLink to="/">
          <img src={MenuIcon} alt='MenuIcon' />
        </NavLink>
        <WarehouseSelectorV2 />
        <NavLink to="/">
          <img src={UserIcon} alt='UserIcon' />
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
