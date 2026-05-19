// src/api/mappers.ts
import {
    CreateProjectResponse,
    GetProjectResponse,
    ListProjectResponseDto,
    ProjectListItemDto,
    RoleDto,
    TechnologyDto,
    TypeDto,
    UserDto,
    MemberDto, SearchUsersResponse,
} from '../types/dto';
import {
    Project,
    ProjectListPage,
    ProjectSummary,
    ProjectType,
    Role,
    Technology,
    User,
    Member,
    Status,
} from '../types/domain';

export const mapUser = (u: UserDto): User => ({
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
});

export const mapUsersSearch = (resp: SearchUsersResponse | null | undefined): User[] => {
    if (!resp || !Array.isArray(resp.items)) return [];
    return resp.items.map(mapUser);
};

const mapType = (t: TypeDto): ProjectType => ({
    id: t.id,
    name: t.name,
});

const mapRole = (r: RoleDto): Role => ({ id: r.id, name: r.name });
const mapTech = (t: TechnologyDto): Technology => ({ id: t.id, name: t.name });

const toStatus = (s: string): Status => {
    if (s === 'DRAFT' || s === 'ACTIVE' || s === 'RECRUITING' || s === 'ARCHIVED') return s;
    // fallback: если бек вернул нестандарт — считаем черновиком
    return 'DRAFT';
};

const dedupeById = <T extends { id: string | number }>(arr: T[] = []): T[] =>
    Array.from(new Map(arr.map(i => [i.id, i])).values());

const mapMember = (m: MemberDto): Member => ({
    id: m.id,
    user: mapUser(m.user),               // <-- главное изменение
    status: (m.status),    // <-- не забываем статус
    roles: dedupeById(m.roles?.map(mapRole) ?? []),
});

export const mapGetProjectResponse = (dto: GetProjectResponse): Project => ({
    id: dto.id,
    name: dto.name,
    shortDescription: dto.shortDescription,
    description: dto.description,
    owner: mapUser(dto.owner),
    type: mapType(dto.type),
    status: toStatus(dto.status),
    technologies: dedupeById(dto.technologyNames?.map(mapTech) ?? []),
    roles: dedupeById(dto.roleNames?.map(mapRole) ?? []),
    members: (dto.members ?? []).map(mapMember),  // <-- теперь user есть
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
});


export const mapCreateProjectResponse = (dto: CreateProjectResponse): Project => ({
    id: dto.id,
    name: dto.name,
    shortDescription: dto.shortDescription,
    description: dto.description,
    owner: mapUser(dto.owner),
    type: mapType(dto.type),
    status: toStatus(dto.status),
    technologies: dto.technologies?.map(mapTech) ?? [],
    roles: dto.roles?.map(mapRole) ?? [],
    members: dto.members?.map(mapMember) ?? [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
});

const mapListItem = (p: ProjectListItemDto): ProjectSummary => ({
    id: p.id,
    name: p.name,
    shortDescription: p.shortDescription,
    owner: mapUser(p.owner),
    type: mapType(p.typeName),
    status: toStatus(p.status),
    technologies: p.technologyNames?.map(mapTech) ?? [],
    roles: p.roleNames?.map(mapRole) ?? [],
    members: p.members?.map(mapUser) ?? [],
    createdAt: p.createdAt,
});

export const mapListResponse = (dto: ListProjectResponseDto): ProjectListPage => ({
    projects: dto.projects.map(mapListItem),
    total: dto.total,
    page: dto.page,
    size: dto.size,
});
