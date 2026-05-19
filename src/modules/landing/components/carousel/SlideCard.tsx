import React from "react";
import styles from "./LandingCarousel.module.css";

interface SlideCardProps {
    title: string;
    text: string;
    img: string;
    cta?: {
        label: string;
        onClick: () => void;
    };
}

const SlideCard: React.FC<SlideCardProps> = ({ title, text, img, cta }) => (
    <div className={styles.slideCard}>
        <div className={styles.imgContainer}>
            <img
                src={img}
                alt=""
                className={styles.slideImgFill}
                draggable={false}
            />
        </div>
        <div className={styles.slideContent}>
            <h3 className={styles.slideTitle}>{title}</h3>
            <p className={styles.slideText}>{text}</p>
            {cta && (
                <button className={styles.ctaBtn} onClick={cta.onClick}>
                    {cta.label}
                </button>
            )}
        </div>
    </div>
);




export default SlideCard;
