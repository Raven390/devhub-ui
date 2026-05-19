import { apiFetch } from '../../../api/http';
import { User } from '../../../types/domain';
import {SearchUsersResponse, UserDto} from '../../../types/dto';
import {mapUser, mapUsersSearch} from '../../../api/mappers';

export async function fetchUserById(id: string): Promise<User> {
    const dto = await apiFetch<UserDto>(`/users/${id}`, { method: 'GET' });
    return mapUser(dto);
}

export interface SearchUsersParams {
    query: string;
    limit?: number; // дефолт на бэке/фронте 10
}

/**
 * GET /users/search?query={q}&limit={n}
 * Возвращает массив "лёгких" пользователей.
 */
export async function searchUsers(params: SearchUsersParams): Promise<User[]> {
    const { query, limit = 10 } = params;

    const q = (query ?? '').trim();
    if (q.length < 2) return []; // локальный гард, чтобы не спамить бек

    const search = new URLSearchParams();
    search.append('query', q);

    if (limit) {
        search.append('limit', String(limit));
    }

    const dtos = await apiFetch<SearchUsersResponse>(`/users/search?${search.toString()}`, { method: 'GET' });
    return mapUsersSearch(dtos);
}

/**
 * POST /users/by-ids
 * Тянем пачкой, чтобы не делать N запросов.
 */
export async function fetchUsersByIds(ids: string[]): Promise<User[]> {
    if (!ids?.length) return [];
    const dtos = await apiFetch<UserDto[]>(
        `/users/by-ids`,
        {
            method: 'POST',
            body: JSON.stringify({ ids }),
        }
    );
    return dtos.map(mapUser);
}
