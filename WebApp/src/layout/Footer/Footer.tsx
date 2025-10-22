import React from "react";
import s from "./footer.module.scss";

// Falls du ein eigenes Logo hast, ersetzen
import logo from "../../assets/Logo_Light.png";
import telegramLogo from "../../assets/TelegramIcon.png";

const Footer: React.FC = () => {
  return (
    <footer className={s.footer}>
      <div className={s.footerBox}>
        <div className={s.leftSection}>
          <img src={logo} alt="DEhub Logo" />
          <span className={s.brand}>DEhub</span>
        </div>
        <div className={s.rightSection}>
          <a
            href="https://t.me/DEhub_Schule60Bot" // <-- hier deinen Telegram Bot Link
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={telegramLogo} alt="Telegram" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
