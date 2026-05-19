import { apiFetch, FetchProjectsParams } from '../../../api/http';
import {
    CreateProjectResponse,
    GetProjectResponse,
    ListProjectResponseDto,
} from '../../../types/dto';
import {
    CreateProjectPayload,
    Project,
    ProjectListPage,
    UpdateProjectPayload,
} from '../../../types/domain';
import {
    mapCreateProjectResponse,
    mapGetProjectResponse,
    mapListResponse,
} from '../../../api/mappers';

export async function fetchProjects(params: FetchProjectsParams = {}): Promise<ProjectListPage> {
    const { page = 0, size = 10, search } = params;
    const query = new URLSearchParams();
    query.append('page', String(page));
    query.append('size', String(size));
    if (search) query.append('search', search);

    const dto = await apiFetch<ListProjectResponseDto>(`/projects?${query.toString()}`, { method: 'GET' });
    return mapListResponse(dto);
}

export async function fetchProjectById(id: string): Promise<Project> {
    const dto = await apiFetch<GetProjectResponse>(`/projects/${id}`, { method: 'GET' });
    return mapGetProjectResponse(dto);
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
    const dto = await apiFetch<CreateProjectResponse>('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return mapCreateProjectResponse(dto);
}

export async function updateProject(id: string, update: UpdateProjectPayload): Promise<Project> {
    const dto = await apiFetch<GetProjectResponse>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(update),
    });
    // Бек может вернуть ту же форму, что и GetProjectResponse
    return mapGetProjectResponse(dto);
}

export async function deleteProject(id: string): Promise<void> {
    await apiFetch(`/projects/${id}`, { method: 'DELETE' });
}
