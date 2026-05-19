import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TbLayoutGrid, TbLogout, TbUser } from 'react-icons/tb';
import keycloak from '../../../../auth/keycloak';
import type { AuthUser } from '../../../../auth/AuthContext';
import styles from './ProjectExplorerHeader.module.css';

interface UserMenuProps {
    user: AuthUser | null;
    onClose: () => void;
    onLocalLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onClose, onLocalLogout }) => {
    const navigate = useNavigate();
    const name = user?.displayName ?? user?.username ?? 'User';
    const email = user?.email ?? 'Аккаунт DevHub';

    const handleLogout = () => {
        onClose();
        onLocalLogout();
        navigate('/', { replace: true });

        try {
            void keycloak.logout({ redirectUri: window.location.origin }).catch(() => undefined);
        } catch {
            // Local session is already cleared and the user is back on the public landing page.
        }
    };

    return (
        <div className={styles.userMenu} role="menu" aria-label="Меню пользователя">
            <div className={styles.userSummary}>
                <div className={styles.userName}>{name}</div>
                <div className={styles.userEmail}>{email}</div>
            </div>
            <div className={styles.menuDivider} />
            <Link className={styles.menuItem} to="/users/me" role="menuitem" onClick={onClose}>
                <TbUser aria-hidden="true" />
                <span>Мой профиль</span>
            </Link>
            <Link className={styles.menuItem} to="/projects?ownerId=me" role="menuitem" onClick={onClose}>
                <TbLayoutGrid aria-hidden="true" />
                <span>Мои проекты</span>
            </Link>
            <div className={styles.menuDivider} />
            <button type="button" className={`${styles.menuItem} ${styles.logoutItem}`} role="menuitem" onClick={handleLogout}>
                <TbLogout aria-hidden="true" />
                <span>Выйти</span>
            </button>
        </div>
    );
};
