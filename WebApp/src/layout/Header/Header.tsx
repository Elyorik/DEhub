import s from './header.module.scss';
import { useState } from 'react';
import BurgerMenu from '../../components/ui/BurgerMenu/BurgerMenu';
import logoLight from '../../assets/Logo_Light.png';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={s.header}>
      <img
        src={logoLight}
        alt="DEBOT Logo"
        className={s.logo}
        onClick={() => setIsMenuOpen(prev => !prev)}
      />

      {/* immer rendern, Visibility/Pointer controlled in CSS */}
      <BurgerMenu
        onClose={() => setIsMenuOpen(false)}
        isOpen={isMenuOpen}
      />
    </header>
  );
}

export default Header;
