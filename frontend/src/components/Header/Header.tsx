import { FC, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from '../../hooks/index';
import block from 'bem-cn';
import Container from '../Container/Container';
import { ReactComponent as Burger } from '../../images/icons/24/burger_menu.svg';
import './Header.scss';

const cnStyles = block('header');

const Header: FC = () => {
  const { isAuth, username } = useSelector((store) => store.user);

  const [loginLink, setLoginLink] = useState<String>('Личный кабинет');

  useEffect(() => {
    if (isAuth) {
      setLoginLink(username);
    }
  }, [username, isAuth]);

  return (
    <header className={cnStyles()}>
      <div className={cnStyles('wrapper')}>
        <NavLink to="/">
          <p>Лого</p>
        </NavLink>
        {!isAuth && (
          <NavLink to="/signin" className={cnStyles('link')}>
            {loginLink}
          </NavLink>
        )}
        {isAuth && (
          <div>
            <p>{loginLink}</p>
          </div>
        )}
        <Burger />
      </div>
    </header>
  );
};

export default Header;
