import React from "react";
import { Project } from "../../../../types/Project";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
    item: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ item }) => (
    <div className={styles.card}>
        <div className={styles.iconPlaceholder} /> {/* Или <img/> если будет */}
        <div>
            <div className={styles.name}>{item.name}</div>
            <div className={styles.statusRow}>
                <span className={styles.status}>{item.status}</span>
                <span className={styles.time}>{item.time}</span>
            </div>
        </div>
    </div>
);

export default ProjectCard;
