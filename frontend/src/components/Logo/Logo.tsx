import React from "react";
import { Link } from "react-router-dom";
import { block } from "bem-cn";
import "./Logo.scss";
import logo from "./logo.svg";

const cnStyles = block("Logo");

const Logo = () => {
  return (
    <Link to="/">
      <img className={cnStyles()} src={logo} alt="Визитки" />
    </Link>
  );
};

export default Logo;
