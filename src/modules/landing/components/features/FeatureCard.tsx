import styles from "./FeaturesList.module.css";

interface FeatureCardProps {
    icon: string;
    title: string;
    text: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, text }) => (
    <div className={styles.featureCard}>
        <span className={styles.featureIcon} aria-hidden>{icon}</span>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureText}>{text}</p>
    </div>
);

export default FeatureCard;
