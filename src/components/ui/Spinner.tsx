import React from 'react';
import styles from './Spinner.module.css';

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <span className={`${styles.spinner} ${className || ''}`} aria-busy="true" />
);
