import { FC } from "react";
import { NavLink } from "react-router-dom";
import block from "bem-cn";
import "./Header.scss";
import MenuIcon from "../../images/react-icons/hi/HiOutlineMenu.svg";
import UserIcon from "../../images/react-icons/hi/HiOutlineUser.svg";
import CartIcon from "../../images/react-icons/hi/HiOutlineShoppingCart.svg";
import WarehousePicker from "../WarehousePicker/WarehousePicker";
import { useGetCartQuery } from "../../services/cartApi";

const cnStyles = block("header");

const Header: FC = () => {
  const { data: cartItems = [] } = useGetCartQuery();
  const cartCount = cartItems.length;

  return (
    <header className={cnStyles()}>
      <div className={cnStyles("wrapper")}>
        <NavLink to="/">
          <img src={MenuIcon} alt="MenuIcon" />
        </NavLink>
        <WarehousePicker />
        <NavLink to="/cart" className={cnStyles("cart-link")}>
          <img src={CartIcon} alt="CartIcon" />
          {cartCount > 0 && (
            <span className={cnStyles("cart-badge")}>
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </NavLink>
        <NavLink to="/">
          <img src={UserIcon} alt="UserIcon" />
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
