import { apiFetch } from '../../../api/http';
import { Role, Technology, ProjectType } from '../../../types/domain';
import { RoleDto, TechnologyDto, TypeDto } from '../../../types/dto';

export async function fetchTechnologies(): Promise<Technology[]> {
    const res = await apiFetch<{ technologies: TechnologyDto[]; total: number; page: number; size: number }>(
        '/reference/technologies'
    );
    return (res.technologies || []).map(t => ({ id: t.id, name: t.name }));
}

export async function fetchRoles(): Promise<Role[]> {
    const res = await apiFetch<{ roles: RoleDto[]; total: number; page: number; size: number }>(
        '/reference/roles'
    );
    return (res.roles || []).map(r => ({ id: r.id, name: r.name }));
}

export async function fetchProjectTypes(): Promise<ProjectType[]> {
    const res = await apiFetch<{ types: TypeDto[]; total: number; page: number; size: number }>(
        '/reference/types'
    );
    return (res.types || []).map(t => ({ id: t.id, name: t.name }));
}
