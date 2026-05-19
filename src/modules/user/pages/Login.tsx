import React, { useState } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Login.module.css';

const KEYCLOAK_TOKEN_ENDPOINT = 'http://localhost:80/realms/gamehub/protocol/openid-connect/token';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from?.pathname || '/projects';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('client_id', 'frontend-app');
        params.append('username', username);
        params.append('password', password);

        try {
            const res = await fetch(KEYCLOAK_TOKEN_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });

            if (!res.ok) {
                setError('Неверный логин или пароль');
                setLoading(false);
                return;
            }

            const data = await res.json();
            login(data.access_token, data.refresh_token);
            navigate(from, { replace: true });
        } catch (err) {
            setError('Ошибка сети или сервера');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.bg}>
            <form onSubmit={handleLogin} className={styles.loginCard} autoComplete="on">
                <div className={styles.logo}>DevHub</div>
                <h2 className={styles.title}>Вход</h2>
                <div className={styles.subtitle}>Добро пожаловать! Введите данные аккаунта</div>

                <input
                    type="text"
                    placeholder="Email или логин"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoFocus
                    className={styles.input}
                    autoComplete="username"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className={styles.input}
                    autoComplete="current-password"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className={styles.loginBtn}
                >
                    {loading ? 'Входим…' : 'Войти'}
                </button>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.hint}>
                    Нет аккаунта? <span className={styles.link} onClick={() => navigate('/register')}>Зарегистрироваться</span>
                </div>
            </form>
        </div>
    );
};

export default Login;
