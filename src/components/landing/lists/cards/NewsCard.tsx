import React from "react";
import { NewsItem } from "../../../../types/NewsItem";
import styles from "./NewsCard.module.css";

interface NewsCardProps {
    item: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => (
    <div className={styles.card}>
        <div className={styles.cardContent}>
            <div className={styles.cardTitle}>{item.title}</div>
            <div className={styles.cardDate}>{item.date}</div>
            <div className={styles.cardDesc}>{item.description}</div>
        </div>
    </div>
);

export default NewsCard;
