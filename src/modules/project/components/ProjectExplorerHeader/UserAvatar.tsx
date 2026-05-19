import React from 'react';
import styles from './ProjectExplorerHeader.module.css';

interface UserAvatarProps {
    name?: string;
    userId?: string;
    isOpen: boolean;
    onClick: () => void;
}

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function avatarColor(userId: string): string {
    const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, userId, isOpen, onClick }) => {
    const label = name?.trim() || 'User';
    const letter = label.charAt(0).toUpperCase();
    const colorSeed = userId?.trim() || label;

    return (
        <button
            type="button"
            className={styles.avatarButton}
            style={{ backgroundColor: avatarColor(colorSeed) }}
            onClick={onClick}
            aria-label="Открыть меню пользователя"
            aria-haspopup="menu"
            aria-expanded={isOpen}
        >
            {letter}
        </button>
    );
};
