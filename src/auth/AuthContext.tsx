import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface AuthUser {
    id: string;
    username: string;
    displayName: string;
    businessId?: string;
    email?: string;
    accessToken: string;
    refreshToken: string;
}

interface JwtPayload {
    sub?: string;
    username?: string;
    preferred_username?: string;
    name?: string;
    email?: string;
    business_id?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    loading: boolean
}

// Создаём контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Провайдер
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Чтение токена из localStorage при загрузке страницы (auto-login)
    useEffect(() => {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (accessToken && refreshToken) {
            setUser(createAuthUser(accessToken, refreshToken));
        }
        setLoading(false); // <- по-любому
    }, []);

    const login = (accessToken: string, refreshToken: string) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        setUser(createAuthUser(accessToken, refreshToken));
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

function createAuthUser(accessToken: string, refreshToken: string): AuthUser {
    const claims = parseJwtClaims(accessToken);
    const username = claims.preferred_username ?? claims.username ?? claims.email ?? 'user';
    const displayName = claims.name ?? username;
    const id = claims.sub ?? claims.business_id ?? username;

    return {
        id,
        username,
        displayName,
        email: claims.email,
        businessId: claims.business_id,
        accessToken,
        refreshToken,
    };
}
