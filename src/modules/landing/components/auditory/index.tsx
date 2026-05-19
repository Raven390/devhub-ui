import AuditoryList from "./AuditoryList";
import styles from "./AuditoryList.module.css";

const AuditorySection: React.FC = () => (
    <section className={styles.audienceSection}>
        <h2>Для кого DevHub?</h2>
        <AuditoryList />
    </section>
);

export default AuditorySection;
