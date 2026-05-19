import { getAccessToken, logout } from '../auth/TokenUtils'; // утилита для доступа к токену
import { API_BASE } from '../config';


export interface FetchProjectsParams {
    page?: number;      // default 0
    size?: number;      // default 10
    search?: string;
    // ...добавишь фильтры при необходимости
}

export async function apiFetch<T>(
    url: string,
    options: RequestInit = {},
    requireAuth: boolean = true
): Promise<T> {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
        'Content-Type': 'application/json',
    };

    if (requireAuth) {
        const token = getAccessToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(API_BASE + url, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Неавторизован — возможно токен истёк, разлогиниваем
        logout();
        throw new Error('Сессия истекла, выполните вход снова');
    }

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Ошибка запроса');
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return res.json();
}
