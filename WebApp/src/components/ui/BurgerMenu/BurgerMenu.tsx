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
  const [openFolder, setOpenFolder] = useState<string | null>(null);
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

  const toggleFolder = (folderName: string) => {
    setOpenFolder(openFolder === folderName ? null : folderName);
  };

  return (
    <div className={`${s.menu} ${visible ? s.open : ""}`} role="dialog" aria-hidden={!visible}>
      <div className={s.menuContent}>
        <ul>
          {/* --- Hauptmenü --- */}
          <li>
            <Link to="/" onClick={handleNavClick}>Hauptmenü</Link>
          </li>

          {/* --- Wissen Folder --- */}
          <li className={s.folder}>
            <button className={s.folderButton} onClick={() => toggleFolder("wissen")}>
              Wissen
              <span className={`${s.arrow} ${openFolder === "wissen" ? s.openArrow : ""}`}>▾</span>
            </button>
            <ul className={`${s.submenu} ${openFolder === "wissen" ? s.show : ""}`}>
              <li><Link to="/suchen" onClick={handleNavClick}>Suchen</Link></li>
              <li><Link to="/neuigkeiten" onClick={handleNavClick}>Neuigkeiten</Link></li>
              <li><Link to="/quellen" onClick={handleNavClick}>Quellen</Link></li>
            </ul>
          </li>

          {/* --- KI Folder --- */}
          <li className={s.folder}>
            <button className={s.folderButton} onClick={() => toggleFolder("Werkzeuge")}>
              KI
              <span className={`${s.arrow} ${openFolder === "Werkzeuge" ? s.openArrow : ""}`}>▾</span>
            </button>
            <ul className={`${s.submenu} ${openFolder === "Werkzeuge" ? s.show : ""}`}>
              <li><Link to="/ki" onClick={handleNavClick}>KI</Link></li>
            </ul>
          </li>

          {/* --- Freizeit Folder --- */}
          <li className={s.folder}>
            <button className={s.folderButton} onClick={() => toggleFolder("freizeit")}>
              Freizeit
              <span className={`${s.arrow} ${openFolder === "freizeit" ? s.openArrow : ""}`}>▾</span>
            </button>
            <ul className={`${s.submenu} ${openFolder === "freizeit" ? s.show : ""}`}>
              <li><Link to="/forum" onClick={handleNavClick}>Forum</Link></li>
              <li><Link to="/spiele" onClick={handleNavClick}>Spiele</Link></li>
            </ul>
          </li>

          {/* --- Über uns --- */}
          <li>
            <Link to="/uber-uns" onClick={handleNavClick}>Über uns</Link>
          </li>
        </ul>

        {/* --- Account unten --- */}
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
