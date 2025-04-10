import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <header className="site-header">
      <div className="logo">
        <Link to="/">Game Data Insights</Link>
      </div>
    </header>
  );
};

export default Header;
