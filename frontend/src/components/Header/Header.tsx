import { FC, useRef, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import block from "bem-cn";
import "./Header.scss";
import MenuIcon from "../../images/react-icons/hi/HiOutlineMenu.svg";
import UserIcon from "../../images/react-icons/hi/HiOutlineUser.svg";
import CartIcon from "../../images/react-icons/hi/HiOutlineShoppingCart.svg";
import WarehousePicker from "../WarehousePicker/WarehousePicker";
import { useGetCartQuery } from "../../services/cartApi";
import { useAppDispatch } from "../../app/hooks";
import { logout } from "../../features/authSlice";

const cnStyles = block("header");

const Header: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: cartItems = [] } = useGetCartQuery();
  const cartCount = cartItems.length;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [burgerOpen, setBurgerOpen] = useState(false);
  const burgerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (burgerRef.current && !burgerRef.current.contains(e.target as Node)) {
        setBurgerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    navigate("/auth");
  };

  return (
    <header className={cnStyles()}>
      <div className={cnStyles("wrapper")}>
        <div className={cnStyles("burger-menu")} ref={burgerRef}>
          <button
            className={cnStyles("burger-btn")}
            onClick={() => setBurgerOpen((v) => !v)}
            aria-label="Навигация"
          >
            <img src={MenuIcon} alt="MenuIcon" />
          </button>
          {burgerOpen && (
            <ul className={cnStyles("burger-dropdown")}>
              <li>
                <button
                  className={cnStyles("burger-dropdown__item")}
                  onClick={() => { navigate("/dashboard"); setBurgerOpen(false); }}
                >
                  📋&nbsp;Каталог товаров
                </button>
              </li>
              <li>
                <button
                  className={cnStyles("burger-dropdown__item")}
                  onClick={() => { navigate("/admin"); setBurgerOpen(false); }}
                >
                  ⚙️&nbsp;Админ-панель
                </button>
              </li>
            </ul>
          )}
        </div>
        <WarehousePicker />
        <NavLink to="/cart" className={cnStyles("cart-link")}>
          <img src={CartIcon} alt="CartIcon" />
          {cartCount > 0 && (
            <span className={cnStyles("cart-badge")}>
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </NavLink>
        <div className={cnStyles("user-menu")} ref={menuRef}>
          <button
            className={cnStyles("user-btn")}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Меню пользователя"
          >
            <img src={UserIcon} alt="UserIcon" />
          </button>
          {menuOpen && (
            <ul className={cnStyles("user-dropdown")}>
              <li>
                <button
                  className={cnStyles("user-dropdown__item")}
                  onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                >
                  Профиль
                </button>
              </li>
              <li>
                <button
                  className={cnStyles("user-dropdown__item")}
                  onClick={() => { navigate("/orders"); setMenuOpen(false); }}
                >
                  Заказы
                </button>
              </li>
              <li>
                <button
                  className={cnStyles("user-dropdown__item", "danger")}
                  onClick={handleLogout}
                >
                  Выйти
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
