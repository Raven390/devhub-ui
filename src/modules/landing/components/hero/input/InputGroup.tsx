import React, { ChangeEvent, FormEvent } from "react";
import { FiMail, FiArrowRight } from "react-icons/fi";
import styles from "./InputGroup.module.css";

interface InputGroupProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    placeholder?: string;
    buttonLabel?: string;
    loading?: boolean;
}

const InputGroup: React.FC<InputGroupProps> = ({
                                                   value,
                                                   onChange,
                                                   onSubmit,
                                                   placeholder = "Введите e-mail",
                                                   buttonLabel = "Зарегистрироваться",
                                                   loading = false,
                                               }) => (
    <form className={styles.form} onSubmit={onSubmit} autoComplete="off">
        <div className={styles.inputGroup}>
            <span className={styles.icon}><FiMail /></span>
            <input
                className={styles.input}
                type="email"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                disabled={loading}
                autoFocus
            />
            <button
                className={styles.btn}
                type="submit"
                disabled={loading}
            >
                {loading ? (
                    <span className={styles.loader}></span>
                ) : (
                    <>
                        {buttonLabel}
                        <span className={styles.arrow}><FiArrowRight /></span>
                    </>
                )}
            </button>
        </div>
    </form>
);

export default InputGroup;
