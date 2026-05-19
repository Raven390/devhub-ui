// src/types/domain.ts

export type UUID = string;
export type Status = 'DRAFT' | 'ACTIVE' | 'RECRUITING' | 'ARCHIVED';
export type MemberStatus = 'OWNER' | 'ACTIVE' | 'INVITED' | 'LEFT' | 'REMOVED';

export interface User {
    id: UUID;
    email?: string;
    name?: string;
    avatarUrl?: string;
}

export interface Role {
    id: number;
    name: string;
}

export interface Technology {
    id: number;
    name: string;
}

export interface ProjectType {
    id: UUID;
    name: string;
}

export interface Member {
    id?: UUID;
    user: User;
    status: MemberStatus
    roles?: Role[];
}

export interface Project {
    id: UUID;
    name: string;
    shortDescription: string;
    description: string;
    owner: User;
    type: ProjectType;
    status: Status;
    technologies: Technology[]; // нормализовали название
    roles: Role[];              // нормализовали название
    members: Member[];
    createdAt: string;
    updatedAt?: string;
}

export interface ProjectSummary {
    id: UUID;
    name: string;
    shortDescription: string;
    owner: User;
    type: ProjectType;
    status: Status;
    technologies: Technology[];
    roles: Role[];
    members: User[]; // в списке достаточно пользователей
    createdAt: string;
}

export interface ProjectListPage {
    projects: ProjectSummary[];
    total: number;
    page: number;
    size: number;
}

/** Пэйлоады на бэкенд */
export interface CreateProjectPayload {
    name: string;
    shortDescription: string;
    description: string;
    status?: Status;
    typeId: UUID;
    technologyIds?: number[];
    roleIds?: number[];
    members?: Member[]
}

export interface UpdateProjectPayload {
    name?: string;
    shortDescription?: string;
    description?: string;
    status?: Status;
    typeId?: UUID;
    technologyIds?: number[];
    roleIds?: number[];
    members?: Member[]
}
