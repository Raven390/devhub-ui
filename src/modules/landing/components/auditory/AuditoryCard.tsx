import styles from "./AuditoryList.module.css";
import React from "react";

interface AuditoryCardProps {
    icon: string;
    title: string;
    text: string;
}

const AuditoryCard: React.FC<AuditoryCardProps> = ({ icon, title, text }) => (
    <div className={styles.audienceCard}>
        <span>{icon}</span>
        <span className={styles.audienceTitle}>{title}</span>
        <div className={styles.cardDescription}>
            {text}
        </div>
    </div>
);

export default AuditoryCard;
