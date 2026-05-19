import React from 'react';
import { TbBell } from 'react-icons/tb';
import { ProjectExplorerHeader } from '../modules/project/components/ProjectExplorerHeader/ProjectExplorerHeader';
import styles from './NewsPage.module.css';

export const NewsPage: React.FC = () => (
    <div className={styles.page}>
        <ProjectExplorerHeader />
        <main className={styles.main}>
            <TbBell className={styles.icon} aria-hidden="true" />
            <h1 className={styles.title}>Новости появятся здесь</h1>
            <p className={styles.text}>Следите за обновлениями платформы</p>
        </main>
    </div>
);

export default NewsPage;
