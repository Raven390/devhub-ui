import FeaturesList from "./FeaturesList";
import styles from "./FeaturesList.module.css";

const FeaturesSection: React.FC = () => (
    <section className={styles.featuresSection}>
        <h2 className={styles.featuresTitle}>
            Возможности DevHub — платформа для командной работы, таск-менеджмента и онлайн-ивентов
        </h2>
        <FeaturesList />
    </section>
);

export default FeaturesSection;
