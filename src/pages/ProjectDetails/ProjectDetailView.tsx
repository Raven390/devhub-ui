import React, { useState } from "react";
import styles from "./ProjectDetailView.module.css";
import { updateProject } from "../../api/ProjectsApi";

import {Project, ProjectType, Technology, Role, Member} from "../../types/domain";

import { EditableField } from "../../components/ui/EditableField";
import { EditableDropdown } from "../../components/ui/EditableDropdown";
import { EditableMultiSelect } from "../../components/ui/EditableMultiSelect";
import ProjectMembersBlock from "../../components/ui/ProjectMembersBlock";

interface ProjectDetailViewProps {
    project: Project;
    technologiesList: Technology[];
    rolesList: Role[];
    projectTypes: ProjectType[];
    canEdit: boolean;
}

const statusOptions = [
    { value: "DRAFT",      label: "Черновик" },
    { value: "ACTIVE",     label: "Активен" },
    { value: "RECRUITING", label: "Набор"   },
    { value: "ARCHIVED",   label: "Архив"   },
] as const;

const SHORT_DESC_MAX_LENGTH = 300;
const PROJECT_NAME_MAX_LENGTH = 128;
const DESCRIPTION_MAX_LENGTH = 3000;

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
                                                                        project,
                                                                        technologiesList,
                                                                        rolesList,
                                                                        projectTypes,
                                                                        canEdit,
                                                                    }) => {
    const [localProject, setLocalProject] = useState<Project>(project);

    // --- Название ---
    const [nameLoading, setNameLoading] = useState(false);
    const validateName = (val: string) => {
        if (!val.trim()) return "Название не может быть пустым";
        if (val.length < 3) return "Слишком короткое название";
        if (val.length > PROJECT_NAME_MAX_LENGTH) return "Максимум 128 символов";
        return null;
    };
    const handleNameSave = async (newName: string) => {
        setNameLoading(true);
        try {
            await updateProject(localProject.id, { name: newName });
            setLocalProject(prev => ({ ...prev, name: newName }));
        } finally {
            setNameLoading(false);
        }
    };

    // --- Краткое описание ---
    const [shortDescLoading, setShortDescLoading] = useState(false);
    const validateShortDesc = (val: string) => {
        if (!val.trim()) return "Описание не может быть пустым";
        if (val.length < 8) return "Слишком короткое описание";
        if (val.length > SHORT_DESC_MAX_LENGTH) return "Максимум 120 символов";
        return null;
    };
    const handleShortDescSave = async (newShort: string) => {
        setShortDescLoading(true);
        try {
            await updateProject(localProject.id, { shortDescription: newShort });
            setLocalProject(prev => ({ ...prev, shortDescription: newShort }));
        } finally {
            setShortDescLoading(false);
        }
    };

    // --- Полное описание ---
    const [descLoading, setDescLoading] = useState(false);
    const validateDesc = (val: string) => {
        if (!val.trim()) return "Описание не может быть пустым";
        if (val.length > DESCRIPTION_MAX_LENGTH) return "Максимум 3000 символов";
        return null;
    };
    const handleDescSave = async (newDesc: string) => {
        setDescLoading(true);
        try {
            await updateProject(localProject.id, { description: newDesc });
            setLocalProject(prev => ({ ...prev, description: newDesc }));
        } finally {
            setDescLoading(false);
        }
    };

    // --- Статус ---
    const [statusLoading, setStatusLoading] = useState(false);
    const handleStatusSave = async (newStatus: string) => {
        setStatusLoading(true);
        try {
            await updateProject(localProject.id, { status: newStatus as Project["status"] });
            setLocalProject(prev => ({ ...prev, status: newStatus as Project["status"] }));
        } finally {
            setStatusLoading(false);
        }
    };

    // --- Тип проекта (UUID) ---
    const [typeLoading, setTypeLoading] = useState(false);
    const handleTypeSave = async (newTypeId: string) => {
        setTypeLoading(true);
        try {
            await updateProject(localProject.id, { typeId: newTypeId });
            const updatedType = projectTypes.find(t => t.id === newTypeId);
            setLocalProject(prev => ({
                ...prev,
                type: updatedType ?? prev.type,
            }));
        } catch (e) {
            console.error(e);
        } finally {
            setTypeLoading(false);
        }
    };

    // --- Технологии ---
    const [techsLoading, setTechsLoading] = useState(false);
    const handleTechsSave = async (newTechNames: string[]) => {
        setTechsLoading(true);
        try {
            const techIds = technologiesList
                .filter(t => newTechNames.includes(t.name))
                .map(t => t.id);
            await updateProject(localProject.id, { technologyIds: techIds });
            const updatedTechs = technologiesList.filter(t => newTechNames.includes(t.name));
            setLocalProject(prev => ({ ...prev, technologies: updatedTechs }));
        } finally {
            setTechsLoading(false);
        }
    };

    // --- Роли ---
    const [rolesLoading, setRolesLoading] = useState(false);
    const handleRolesSave = async (newRoleNames: string[]) => {
        setRolesLoading(true);
        try {
            const roleIds = rolesList
                .filter(r => newRoleNames.includes(r.name))
                .map(r => r.id);
            await updateProject(localProject.id, { roleIds });
            const updatedRoles = rolesList.filter(r => newRoleNames.includes(r.name));
            setLocalProject(prev => ({ ...prev, roles: updatedRoles }));
        } finally {
            setRolesLoading(false);
        }
    };

    // Текущие значения имен для мультиселектов из доменной модели
    const techNames = (localProject.technologies ?? []).map(t => t.name);
    const roleNames = (localProject.roles ?? []).map(r => r.name);

    // --- Участники ---
    const [membersLoading, setMembersLoading] = useState(false);

    const handleMembersSave = async (newMembers: Member[]) => {
        setMembersLoading(true);
        try {
            // 1) Фильтруем и нормализуем вход
            const cleaned: Member[] = newMembers
                .filter(Boolean)
                .map(m => ({
                    ...m,
                    // Гарантируем наличие user-объекта. Если где-то просочился { userId }, подхватим.
                    user: m.user ?? (('userId' in (m as any)) ? { id: (m as any).userId } : undefined),
                    // Чистим и дедупим роли, отсекаем undefined
                    roles: Array.from(
                        new Map(
                            ((m.roles ?? []).filter((r): r is Role => !!r) as Role[]).map(r => [r.id, r])
                        ).values()
                    ),
                }))
                // Если нет user.id — такой элемент отбрасываем и логируем
                .filter(m => {
                    const ok = !!m.user?.id;
                    if (!ok) {
                        console.warn('[members] пропущен элемент без user.id:', m);
                    }
                    return ok;
                });

            // 2) DTO под бэк
            const membersDto = cleaned.map(m => ({
                // для новых "временных" — не шлём id, чтобы бэк создал запись
                id: (m.id && !String(m.id).startsWith('temp-')) ? m.id : undefined,
                user: { id: m.user!.id },
                roles: (m.roles ?? []).map(r => ({ id: r.id, name: r.name })),
                status: m.status,
            }));

            console.table(cleaned.map(m => ({
                mid: m.id,
                userId: m.user?.id,
                roles: (m.roles ?? []).map(r => r.id).join(','),
                status: m.status
            })));


            await updateProject(localProject.id, { members: membersDto });

            // 3) Оптимистичное локальное состояние — уже очищенное
            setLocalProject(prev => ({
                ...prev,
                members: cleaned,
            }));
        } finally {
            setMembersLoading(false);
        }
    };


    return (
        <div className={styles.container}>
            {/* Заголовок + статус */}
            <div className={styles.header}>
                <div className={styles.avatarBlock}>
                    {localProject.owner?.avatarUrl ? (
                        <img
                            className={styles.avatar}
                            src={localProject.owner.avatarUrl}
                            alt={localProject.name}
                        />
                    ) : (
                        <div className={styles.avatarFallback}>
                            {localProject.name.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className={styles.titleBlock}>
                    <EditableField
                        label="Название проекта"
                        value={localProject.name ?? ""}
                        canEdit={canEdit}
                        onSave={handleNameSave}
                        loading={nameLoading}
                        maxLength={PROJECT_NAME_MAX_LENGTH}
                        validate={validateName}
                        placeholder="Введите название"
                    />

                    <div className={styles.section}>
                        <EditableDropdown
                            label="Статус"
                            value={localProject.status || "DRAFT"}
                            options={statusOptions as unknown as { value: string; label: string }[]}
                            canEdit={canEdit}
                            onSave={handleStatusSave}
                            loading={statusLoading}
                        />
                    </div>
                </div>
            </div>

            {/* Краткое описание */}
            <div className={styles.section}>
                <EditableField
                    label="Краткое описание"
                    value={localProject.shortDescription ?? ""}
                    canEdit={canEdit}
                    onSave={handleShortDescSave}
                    loading={shortDescLoading}
                    maxLength={SHORT_DESC_MAX_LENGTH}
                    validate={validateShortDesc}
                    placeholder="В двух словах о проекте"
                />
            </div>

            {/* Полное описание */}
            <div className={styles.section}>
                <EditableField
                    label="Описание"
                    value={localProject.description ?? ""}
                    canEdit={canEdit}
                    onSave={handleDescSave}
                    loading={descLoading}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    validate={validateDesc}
                    inputType="textarea"
                    placeholder="Полное описание проекта (можно форматировать)"
                />
            </div>

            {/* Технологии */}
            <div className={styles.section}>
                <EditableMultiSelect
                    label="Технологии"
                    values={techNames}
                    options={technologiesList}
                    canEdit={canEdit}
                    onSave={handleTechsSave}
                    loading={techsLoading}
                    placeholder="Выберите технологии"
                />
            </div>

            {/* Роли */}
            <div className={styles.section}>
                <EditableMultiSelect
                    label="Роли"
                    values={roleNames}
                    options={rolesList}
                    canEdit={canEdit}
                    onSave={handleRolesSave}
                    loading={rolesLoading}
                    placeholder="Выберите роли"
                />
            </div>

            {/* Тип проекта */}
            <div className={styles.section}>
                <EditableDropdown
                    label="Тип проекта"
                    value={localProject.type?.id || ""}
                    options={projectTypes.map(type => ({
                        value: type.id,
                        label: type.name,
                    }))}
                    canEdit={canEdit}
                    onSave={handleTypeSave}
                    loading={typeLoading}
                />
            </div>

            {/* Владелец */}
            <div className={styles.section}>
                <div className={styles.label}>Владелец</div>
                <div className={styles.ownerBlock}>
                    <div className={styles.ownerAvatar}>
                        {(localProject.owner?.name ?? "U").slice(0, 2).toUpperCase()}
                    </div>
                    <span className={styles.ownerName}>{localProject.owner?.name ?? "Unknown"}</span>
                </div>
            </div>
            <div className={styles.section}>
                <ProjectMembersBlock
                    members={localProject.members ?? []}
                    rolesCatalog={rolesList}
                    canEdit={canEdit}
                    onMembersChange={handleMembersSave}
                />
                {membersLoading && <div style={{marginTop: 8, opacity: .7}}>Сохраняем участников…</div>}
            </div>

            {/* Дата */}
            <div className={styles.section}>
                <div className={styles.label}>Дата создания</div>
                <span className={styles.date}>
          {localProject.createdAt ? new Date(localProject.createdAt).toLocaleDateString() : "–"}
        </span>
            </div>
        </div>
    );
};
