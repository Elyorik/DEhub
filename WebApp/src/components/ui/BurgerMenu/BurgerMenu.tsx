import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import s from "./burgerMenu.module.scss";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";

  interface BurgerMenuProps {
    onClose: () => void;
    isOpen: boolean;
  }

  const ANIMATION_DURATION = 1000;

  function BurgerMenu({ onClose, isOpen }: BurgerMenuProps) {
    const [render, setRender] = useState(isOpen);
    const [visible, setVisible] = useState(false);

    const user = useSelector((state: RootState) => state.user.currentUser);

    useEffect(() => {
      if (isOpen) {
        setRender(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setVisible(true));
        });
      } else {
        setVisible(false);
        const t = setTimeout(() => setRender(false), ANIMATION_DURATION);
        return () => clearTimeout(t);
      }
    }, [isOpen]);

    if (!render) return null;

    const handleNavClick = () => {
      setVisible(false);
      setTimeout(() => onClose(), ANIMATION_DURATION);
    };

    return (
      <div
        className={`${s.menu} ${visible ? s.open : ""}`}
        role="dialog"
        aria-hidden={!visible}
      >
        <div className={s.menuContent}>
          <ul>
            <li>
              <Link to="/">Hauptmenu</Link>
            </li>
            <li>
              <Link to="/suchen" onClick={handleNavClick}>
                Suchen
              </Link>
            </li>
            <li>
              <Link to="/neuigkeiten" onClick={handleNavClick}>
                Neuigkeiten
              </Link>
            </li>
            <li>
              <Link to="/ki-werkzeuge" onClick={handleNavClick}>
                KI Werkzeuge
              </Link>
            </li>
            <li>
              <Link to="/uber-uns" onClick={handleNavClick}>
                Über uns
              </Link>
            </li>
          </ul>

          <div className={s.accountSection}>
            <Link to="/account" onClick={handleNavClick}>
              {user ? user.name : "Gast"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  export default BurgerMenu;
