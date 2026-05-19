import { create } from 'zustand';
import * as projectsApi from '../api/ProjectsApi';
import {
    CreateProjectPayload,
    Project,
    ProjectSummary,
    UpdateProjectPayload,
    UUID,
} from '../../../types/domain';

interface ProjectsStore {
    projects: ProjectSummary[];
    loading: boolean;
    error: string | null;
    fetchProjects: () => Promise<void>;
    createProject: (project: CreateProjectPayload) => Promise<void>;
    updateProject: (id: UUID, update: UpdateProjectPayload) => Promise<void>;
    deleteProject: (id: UUID) => Promise<void>;
}

const getStoreErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
};

const toProjectSummary = (project: Project): ProjectSummary => ({
    id: project.id,
    name: project.name,
    shortDescription: project.shortDescription,
    owner: project.owner,
    type: project.type,
    status: project.status,
    technologies: project.technologies,
    roles: project.roles,
    members: project.members.map((member) => member.user),
    createdAt: project.createdAt,
});

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
    projects: [],
    loading: false,
    error: null,

    // Получить список проектов
    fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
            const data = await projectsApi.fetchProjects();
            set({ projects: data.projects, loading: false });
        } catch (error: unknown) {
            set({ error: getStoreErrorMessage(error, 'Ошибка загрузки проектов'), loading: false });
        }
    },

    // Создать проект
    createProject: async (project) => {
        set({ loading: true, error: null });
        try {
            const created = await projectsApi.createProject(project);
            set({ projects: [toProjectSummary(created), ...get().projects], loading: false });
        } catch (error: unknown) {
            set({ error: getStoreErrorMessage(error, 'Ошибка создания'), loading: false });
        }
    },

    // Обновить проект
    updateProject: async (id, update) => {
        set({ loading: true, error: null });
        try {
            const updated = await projectsApi.updateProject(id, update);
            const updatedSummary = toProjectSummary(updated);
            set({
                projects: get().projects.map(p => p.id === id ? updatedSummary : p),
                loading: false
            });
        } catch (error: unknown) {
            set({ error: getStoreErrorMessage(error, 'Ошибка обновления'), loading: false });
        }
    },

    // Удалить проект
    deleteProject: async (id) => {
        set({ loading: true, error: null });
        try {
            await projectsApi.deleteProject(id);
            set({
                projects: get().projects.filter(p => p.id !== id),
                loading: false
            });
        } catch (error: unknown) {
            set({ error: getStoreErrorMessage(error, 'Ошибка удаления'), loading: false });
        }
    },
}));
