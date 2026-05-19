import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/AuthApi';
import styles from './Register.module.css';

const KEYCLOAK_USER_API = 'http://localhost:8080/admin/realms/gamehub/users'; // Это admin endpoint

const Register: React.FC = () => {
    const [name, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    // ⚠️ Для настоящего продакшна регистрацию лучше делать через бэкенд, чтобы не светить admin токен на фронте!
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await registerUser({ name, email, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 1400);
        } catch (err: any) {
            setError(err.message || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.bg}>
            <form onSubmit={handleRegister} className={styles.regCard} autoComplete="on">
                <div className={styles.logo}>DevHub</div>
                <h2 className={styles.title}>Регистрация</h2>
                <div className={styles.subtitle}>Создайте новый аккаунт</div>

                <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={name}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className={styles.input}
                    autoFocus
                    autoComplete="username"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className={styles.input}
                    autoComplete="email"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className={styles.input}
                    autoComplete="new-password"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className={styles.regBtn}
                >
                    {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
                </button>
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>Регистрация успешна!</div>}

                <div className={styles.hint}>
                    Уже есть аккаунт? <span className={styles.link} onClick={() => navigate('/login')}>Войти</span>
                </div>
            </form>
        </div>
    );
};

export default Register;
