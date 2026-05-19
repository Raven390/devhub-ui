import React, {useState} from "react";
import styles from "./LandingCarousel.module.css";
import SlideCard from "./SlideCard";

// Моки для примера
// @ts-ignore
import mockImg1 from "../../../../assets/carousel/create-project.png";
// @ts-ignore
import mockImg2 from "../../../../assets/carousel/team-slots.png";
// @ts-ignore
import mockImg3 from "../../../../assets/carousel/find-project.png";
// @ts-ignore
import mockImg4 from "../../../../assets/carousel/cta-end.png";

const slides = [
    {
        title: "Создай проект",
        text: "Запусти свою идею — выбери стек, роли и позови команду.",
        img: mockImg1,
    },
    {
        title: "Собери команду",
        text: "Видишь свободные слоты? Приглашай участников или оставляй заявку.",
        img: mockImg2,
    },
    {
        title: "Найди проект по интересам",
        text: "Отфильтруй проекты по открытым ролям и статусу — находи актуальные команды.",
        img: mockImg3,
    },
    {
        title: "Начни прямо сейчас!",
        text: "Покажи демо, получай фидбек, развивайся вместе с комьюнити.",
        img: mockImg4,
        cta: {
            label: "Присоединиться",
            onClick: () => window.scrollTo({top: 0, behavior: "smooth"}), // тут твой кастомный хендлер
        },
    },
];

const LandingCarousel: React.FC = () => {
    const [active, setActive] = useState(0);
    const leftIndex = (active - 1 + slides.length) % slides.length;
    const rightIndex = (active + 1) % slides.length;
    return (
        <section className={styles.carouselSection}>
            <div className={styles.carouselTrack}>
                {/* Левая peek */}
                <div
                    className={styles.card + " " + styles.leftPeek}
                    onClick={() => setActive(leftIndex)}
                    key={leftIndex}
                >
                    <SlideCard {...slides[leftIndex]} />
                </div>
                {/* Активная */}
                <div
                    className={styles.card + " " + styles.activeCard}
                    key={active}
                >
                    <SlideCard {...slides[active]} />
                </div>
                {/* Правая peek */}
                <div
                    className={styles.card + " " + styles.rightPeek}
                    onClick={() => setActive(rightIndex)}
                    key={rightIndex}
                >
                    <SlideCard {...slides[rightIndex]} />
                </div>
            </div>
            <div className={styles.dots}>
                {slides.map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.dot} ${i === active ? styles.active : ""}`}
                        onClick={() => setActive(i)}
                        aria-label={`Перейти к слайду ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    )
        ;
};

export default LandingCarousel;
