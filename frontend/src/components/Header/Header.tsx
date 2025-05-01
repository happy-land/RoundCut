import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import block from 'bem-cn';
import './Header.scss';
import MenuIcon from '../../images/react-icons/hi/HiOutlineMenu.svg';
import UserIcon from '../../images/react-icons/hi/HiOutlineUser.svg';
import WarehousePicker from '../WarehousePicker/WarehousePicker';

const cnStyles = block('header');

const Header: FC = () => {
  return (
    <header className={cnStyles()}>
      <div className={cnStyles('wrapper')}>
        <NavLink to="/">
          <img src={MenuIcon} alt="MenuIcon" />
        </NavLink>
        <WarehousePicker />
        <NavLink to="/">
          <img src={UserIcon} alt="UserIcon" />
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
