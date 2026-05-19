import React from "react";
import { NewsItem } from "../../../../types/NewsItem";
import NewsCard from "./cards/NewsCard";
import styles from "./NewsList.module.css";

interface NewsListProps {
    items: NewsItem[];
}

const NewsList: React.FC<NewsListProps> = ({ items }) => {
    // Сортировка по дате: последние сверху (дата в формате YYYY-MM-DD)
    const sorted = [...items].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <section className={styles.newsSection}>
            <h2 className={styles.title}>Community News</h2>
            <div className={styles.newsGrid}>
                {sorted.slice(0, 5).map(item => (
                    <NewsCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
};

export default NewsList;
