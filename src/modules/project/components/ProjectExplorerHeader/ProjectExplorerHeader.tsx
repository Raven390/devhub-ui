import React, { useEffect, useRef, useState } from 'react';
import styles from './ProjectExplorerHeader.module.css';
import { useAuth } from '../../../../auth/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UserAvatar } from './UserAvatar';
import { UserMenu } from './UserMenu';

const navLinks = [
    { label: 'Проекты', to: '/projects' },
    { label: 'Новости', to: '/news' },
    { label: 'Профиль', to: '/users/me' },
];

export const ProjectExplorerHeader: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isMenuOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMenuOpen]);

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <Link to="/" className={styles.logo}>DevHub</Link>
                <nav className={styles.nav}>
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div className={styles.right}>
                <button className={styles.createBtn} title="Создать новый проект"
                        onClick={() => navigate('/projects/create')}>
                    + Создать проект
                </button>
                <div className={styles.avatarMenu} ref={menuRef}>
                    <UserAvatar
                        name={user?.displayName ?? user?.username}
                        userId={user?.id}
                        isOpen={isMenuOpen}
                        onClick={() => setIsMenuOpen((current) => !current)}
                    />
                    {isMenuOpen ? (
                        <UserMenu
                            user={user}
                            onClose={() => setIsMenuOpen(false)}
                            onLocalLogout={logout}
                        />
                    ) : null}
                </div>
            </div>
        </header>
    );
};

export default ProjectExplorerHeader;
