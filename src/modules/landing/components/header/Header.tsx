import React from 'react';
import styles from './Header.module.css';
import {useNavigate} from "react-router-dom";
import {useAuth} from '../../../../auth/AuthContext';
import Avatar from '../../../../components/avatar/Avatar';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const {user, logout} = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <div className={styles.left}>
                    <a href="/" className={styles.logo}>DevHub</a>
                    <nav className={styles.nav} aria-label="Главная навигация">
                        <a href="#about" className={styles.link}>О платформе</a>
                        <a href="#faq" className={styles.link}>FAQ</a>
                        <a href="#contacts" className={styles.link}>Контакты</a>
                    </nav>
                </div>
                <div className={styles.actions}>
                    {user ? (
                        <>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <Avatar username={user.username}/>
                                <span className={styles.userInfo}>
                                    {user.username || 'Пользователь'}
                                </span>
                                <button
                                    className={styles.logoutBtn}
                                    onClick={logout}
                                    tabIndex={0}
                                >
                                    Выйти
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                        <button
                                className={styles.loginBtn}
                                onClick={() => navigate('/login')}
                            >
                                Войти
                            </button>
                            <button
                                className={styles.signupBtn}
                                onClick={() => navigate('/register')}
                            >
                                Присоединиться
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
