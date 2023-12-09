import block from 'bem-cn';
import './Header.scss';
import Container from '../Container/Container';
import { NavLink } from 'react-router-dom';
const cnStyles = block('header');

const Header = () => {
  return (
    <header className={cnStyles()}>
      <div className={cnStyles('wrapper')}>
        <NavLink to="/">
          <p>Лого</p>
        </NavLink>
        <NavLink to="/profile" className={cnStyles('link')}>
          Личный кабинет
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
