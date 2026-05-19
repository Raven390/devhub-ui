import React from 'react';
import styles from './ProjectFormPage.module.css';
import ProjectForm from '../components/ProjectForm/ProjectForm';
import Header from "../components/ProjectExplorerHeader/ProjectExplorerHeader";

const ProjectFormPage: React.FC = () => {
    return (
        <div className={styles.root}>
            <Header />
            <main className={styles.main}>
                <div className={styles.formCard}>
                    <ProjectForm />
                </div>
            </main>
        </div>
    );
};

export default ProjectFormPage;
