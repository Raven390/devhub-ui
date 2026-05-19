import React, { useState } from 'react';
import styles from './HeroSection.module.css';
import InputGroup from './input/InputGroup';

const HeroSection: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Зарегистрирован email: ${email}`);
  };

  return (
      <section className={styles.hero}>
        <div className={styles.inner}>
          <h1 className={styles.title}>
            Воплоти идею вместе с единомышленниками
          </h1>
          <p className={styles.subtitle}>
            🚀 Легко находи команду и доводи проект до результата — с поддержкой живого комьюнити.
          </p>
          <button className={styles.signupBtn}>Найти команду</button>
        </div>
      </section>
  );
};

export default HeroSection;
