import React from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { ProjectExplorerHeader } from '../../project/components/ProjectExplorerHeader/ProjectExplorerHeader';
import styles from './ProfilePage.module.css';

export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const displayName = user?.displayName ?? user?.username ?? 'User';

    return (
        <div className={styles.page}>
            <ProjectExplorerHeader />
            <main className={styles.main}>
                <section className={styles.panel} aria-labelledby="profile-title">
                    <p className={styles.kicker}>DevHub Profile</p>
                    <h1 id="profile-title" className={styles.title}>Профиль</h1>
                    <div className={styles.details}>
                        <div>
                            <span className={styles.label}>Имя</span>
                            <span className={styles.value}>{displayName}</span>
                        </div>
                        <div>
                            <span className={styles.label}>Email</span>
                            <span className={styles.value}>{user?.email ?? 'Не указан'}</span>
                        </div>
                        <div>
                            <span className={styles.label}>ID</span>
                            <span className={styles.value}>{user?.id ?? 'Не указан'}</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProfilePage;
