import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

// Типы
interface User {
    username: string;
    businessId?: string;
    email?: string;
    accessToken: string;
    refreshToken: string;
}

interface JwtPayload {
    username?: string;
    email?: string;
    business_id?: string;
}

interface AuthContextType {
    user: User | null;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    loading: boolean
}

// Создаём контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Провайдер
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Чтение токена из localStorage при загрузке страницы (auto-login)
    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (accessToken && refreshToken) {
            const claims = parseJwtClaims(accessToken);
            const { username, email, business_id } = claims;

            setUser({
                username: username ?? 'user',
                email,
                businessId: business_id,
                accessToken,
                refreshToken,
            });

            console.log('[AuthProvider] businessId:', business_id);
        }
        setLoading(false); // <- по-любому
    }, []);

    const login = (accessToken: string, refreshToken: string) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        setUser({ username: 'user', accessToken, refreshToken });
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading  }}>
            {children}
        </AuthContext.Provider>
    );
};

// Хук для использования
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider');
    return ctx;
};

function parseJwtClaims(token: string): JwtPayload {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch {
        return {} as JwtPayload;
    }
}

