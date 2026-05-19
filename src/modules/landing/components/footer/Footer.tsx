import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => (
    <footer className={styles.footer}>
        <div className={styles.inner}>
            <span className={styles.logo}>DevHub</span>
            <nav className={styles.links}>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>
                <a href="#privacy">Политика конфиденциальности</a>
                {/* Можно добавить: <a href="#terms">Пользовательское соглашение</a> */}
            </nav>
            <span className={styles.copy}>
        © {new Date().getFullYear()} DevHub. All rights reserved.
      </span>
        </div>
    </footer>
);

export default Footer;
