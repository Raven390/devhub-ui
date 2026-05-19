import React from "react";
import { Project } from "../../../../types/Project";
import styles from "./ProjectList.module.css";

interface ProjectListProps {
    items: Project[];
}

const statusColor: Record<string, string> = {
    Active: "#52ffbc",
    Review: "#ffd452",
    Done: "#7dd3fc"
};

const statusBg: Record<string, string> = {
    Active: "#22313b",
    Review: "#52401a",
    Done: "#133148"
};

const ProjectList: React.FC<ProjectListProps> = ({ items }) => (
    <div>
        <h2 className={styles.heading}>Top Projects</h2>
        {items.length === 0 ? (
            <div className={styles.empty}>No projects yet</div>
        ) : (
            items.map(proj => (
                <div className={styles.card} key={proj.id}>
                    <div className={styles.cardIcon}>
                        {/* Использует icon если есть, иначе первую букву */}
                        {"icon" in proj && proj.icon
                            ? proj.icon
                            : proj.name[0]}
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.cardTitle}>{proj.name}</div>
                        <div className={styles.cardMeta}>
                            <span
                                className={styles.cardStatus}
                                style={{
                                    background: statusBg[proj.status] ?? "#26323b",
                                    color: statusColor[proj.status] ?? "#b9fcca"
                                }}
                            >
                                {proj.status}
                            </span>
                            <span className={styles.cardTime}>{proj.time}</span>
                        </div>
                    </div>
                </div>
            ))
        )}
    </div>
);

export default ProjectList;
