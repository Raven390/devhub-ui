import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Login.module.css';
import { KEYCLOAK_CLIENT, KEYCLOAK_REALM, KEYCLOAK_URL } from '../../../config';

const keycloakTokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

interface LoginLocationState {
    from?: {
        pathname?: string;
    };
}

interface TokenResponse {
    access_token: string;
    refresh_token: string;
}

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const e2eLoginStartedRef = useRef(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const locationState = location.state as LoginLocationState | null;
    const from = locationState?.from?.pathname ?? '/projects';

    const submitCredentials = useCallback(async (emailOrUsername: string, userPassword: string) => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('client_id', KEYCLOAK_CLIENT);
        params.append('username', emailOrUsername);
        params.append('password', userPassword);

        try {
            const res = await fetch(keycloakTokenEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });

            if (!res.ok) {
                setError('Неверный логин или пароль');
                setLoading(false);
                return;
            }

            const data = await res.json() as TokenResponse;
            login(data.access_token, data.refresh_token);
            navigate(from, { replace: true });
        } catch {
            setError('Ошибка сети или сервера');
        } finally {
            setLoading(false);
        }
    }, [from, login, navigate]);

    useEffect(() => {
        if (!import.meta.env.DEV || e2eLoginStartedRef.current) return;

        const params = new URLSearchParams(location.search);
        const isE2eLogin = params.get('e2eLogin') === '1';
        const e2eEmail = params.get('e2eEmail');
        const e2ePassword = params.get('e2ePassword');

        if (!isE2eLogin || !e2eEmail || !e2ePassword) return;

        e2eLoginStartedRef.current = true;
        setUsername(e2eEmail);
        setPassword(e2ePassword);
        void submitCredentials(e2eEmail, e2ePassword);
    }, [location.search, submitCredentials]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        void submitCredentials(username, password);
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
