import React from "react";
import PropTypes from "prop-types";
import logoSrc from "/public/img/logoshih.png";

import { Link } from "react-router-dom";
import {
  Navbar as MTNavbar,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Navbar({ brandName, routes, action, logoSrc }) {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const navList = (
    <ul className="mb-4  flex flex-col gap-2 text-inherit lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {routes.map(({ name, path, icon, href, target }) => (
        <Typography
          key={name}
          as="li"
          variant="small"
          color="inherit"
          className="capitalize hover:border-b-2 hover:border-orange-500"
        >
          {href ? (
            <a
              href={href}
              target={target}
              className="flex items-center gap-1 p-1 font-bold"
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-[18px] h-[18px] opacity-75 mr-1",
                })}
              {name}
            </a>
          ) : (
            <Link
              to={path}
              target={target}
              className="flex items-center gap-1 p-1 "
            >
              {icon &&
                React.createElement(icon, {
                  className: "w-[18px] h-[18px] opacity-75 mr-1",
                })}
              {name}
            </Link>
          )}
        </Typography>
      ))}
    </ul>
  );

  return (
    <div className="w-full fixed z-50 bg-white top-0">
      <MTNavbar color="transparent">
        <div className="mx-auto flex items-center justify-between text-black">
          <Link to="/">
            <div className="flex items-center">
              <img
                src={logoSrc}
                alt="CollabHub Logo"
                className="h-16 w-25 mr-2 flex items-center"
              />
            </div>
          </Link>
          <div className={`lg:block ${openNav ? 'hidden' : ''}`}>{navList}</div>
          <div className="hidden gap-2 lg:flex">
            {React.cloneElement(action, {
              className: "hidden lg:inline-block",
            })}
          </div>
          <IconButton
            variant="text"
            size="sm"
            color="white"
            className="ml-auto text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <XMarkIcon strokeWidth={2} className="h-6 w-6" />
            ) : (
              <Bars3Icon strokeWidth={2} className="h-6 w-6" />
            )}
          </IconButton>
        </div>
      </MTNavbar>
      <hr />
    </div>
  );
}

Navbar.defaultProps = {
  brandName: "CollabHub",
  action: <a target="_blank"></a>,
  logoSrc: logoSrc,
};

Navbar.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  action: PropTypes.node,
  logoSrc: PropTypes.string,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;