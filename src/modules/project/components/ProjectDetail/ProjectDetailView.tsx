import React, { useCallback, useMemo, useState } from "react";
import styles from "./ProjectDetailView.module.css";
import { updateProject } from "../../api/ProjectsApi";
import { removeProjectMember, updateMemberStatus } from "../../api/membership";

import {Project, ProjectType, Technology, Role, Member} from "../../../../types/domain";

import { EditableField } from "../../../../components/ui/EditableField";
import { EditableDropdown } from "../../../../components/ui/EditableDropdown";
import { EditableMultiSelect } from "../../../../components/ui/EditableMultiSelect";
import ProjectMembersBlock from "../ProjectMembersBlock";
import { JoinProjectButton } from "../JoinProjectButton";

interface ProjectDetailViewProps {
    project: Project;
    technologiesList: Technology[];
    rolesList: Role[];
    projectTypes: ProjectType[];
    canEdit: boolean;
    currentUserId?: string;
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
                                                                        currentUserId,
                                                                    }) => {
    const [localProject, setLocalProject] = useState<Project>(project);
    const [memberActionBusyId, setMemberActionBusyId] = useState<string | null>(null);
    const [memberActionError, setMemberActionError] = useState<string | null>(null);

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

    const memberKey = useCallback((member: Member) => member.id ?? member.user.id, []);

    const replaceMember = useCallback((updatedMember: Member) => {
        setLocalProject(prev => {
            const hasMember = prev.members.some(member => (
                (updatedMember.id && member.id === updatedMember.id) ||
                member.user.id === updatedMember.user.id
            ));

            return {
                ...prev,
                members: hasMember
                    ? prev.members.map(member => (
                        (updatedMember.id && member.id === updatedMember.id) ||
                        member.user.id === updatedMember.user.id
                            ? updatedMember
                            : member
                    ))
                    : [...prev.members, updatedMember],
            };
        });
    }, []);

    const invitedMembers = useMemo(
        () => localProject.members.filter(member => member.status === 'INVITED'),
        [localProject.members],
    );

    const runMemberAction = useCallback(async (
        member: Member,
        action: (memberId: string) => Promise<Member | void>,
        fallbackMember?: Member,
    ) => {
        if (!member.id) {
            setMemberActionError('Для этой записи участника не получен id от сервера');
            return;
        }

        const busyId = memberKey(member);
        setMemberActionBusyId(busyId);
        setMemberActionError(null);
        try {
            const updatedMember = await action(member.id);
            replaceMember(updatedMember ?? fallbackMember ?? member);
        } catch (err) {
            setMemberActionError(err instanceof Error ? err.message : 'Не удалось обновить участника');
        } finally {
            setMemberActionBusyId(null);
        }
    }, [memberKey, replaceMember]);

    const handleJoined = useCallback((member: Member) => {
        replaceMember(member);
    }, [replaceMember]);

    const handleAcceptRequest = useCallback((member: Member) => {
        void runMemberAction(member, memberId => updateMemberStatus(localProject.id, memberId, 'ACTIVE'));
    }, [localProject.id, runMemberAction]);

    const handleRejectRequest = useCallback((member: Member) => {
        void runMemberAction(
            member,
            memberId => updateMemberStatus(localProject.id, memberId, 'REMOVED'),
            { ...member, status: 'REMOVED' },
        );
    }, [localProject.id, runMemberAction]);

    const handleRemoveMember = useCallback((member: Member) => {
        if (!confirm('Исключить участника из проекта?')) return;
        void runMemberAction(
            member,
            memberId => removeProjectMember(localProject.id, memberId),
            { ...member, status: 'REMOVED' },
        );
    }, [localProject.id, runMemberAction]);

    const handleLeaveProject = useCallback((member: Member) => {
        const message = member.status === 'INVITED'
            ? 'Отменить заявку на вступление?'
            : 'Вы уверены, что хотите покинуть проект? Это действие нельзя отменить.';
        if (!confirm(message)) return;

        void runMemberAction(
            member,
            memberId => removeProjectMember(localProject.id, memberId),
            { ...member, status: 'LEFT' },
        );
    }, [localProject.id, runMemberAction]);


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
                <div className={styles.membersHeader}>
                    <div>
                        <div className={styles.label}>Команда</div>
                    </div>
                    {currentUserId && (
                        <JoinProjectButton
                            projectId={localProject.id}
                            roles={rolesList}
                            currentUserId={currentUserId}
                            projectStatus={localProject.status}
                            members={localProject.members ?? []}
                            onJoined={handleJoined}
                        />
                    )}
                </div>
                <ProjectMembersBlock
                    members={localProject.members ?? []}
                    rolesCatalog={rolesList}
                    canEdit={canEdit}
                    currentUserId={currentUserId}
                    actionBusyId={memberActionBusyId}
                    onRemoveMember={handleRemoveMember}
                    onLeaveProject={handleLeaveProject}
                />
                {memberActionError && (
                    <div className={styles.memberActionError} role="alert">{memberActionError}</div>
                )}
            </div>

            {canEdit && invitedMembers.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.label}>Входящие заявки</div>
                    <ul className={styles.requestList}>
                        {invitedMembers.map(member => {
                            const id = memberKey(member);
                            const isBusy = memberActionBusyId === id;
                            const roles = member.roles ?? [];

                            return (
                                <li key={id} className={styles.requestItem}>
                                    <div className={styles.requestUser}>
                                        <span className={styles.requestName}>
                                            {member.user.name || member.user.email || 'User'}
                                        </span>
                                        <div className={styles.requestRoles}>
                                            {roles.length > 0 ? (
                                                roles.map(role => (
                                                    <span key={role.id} className={styles.requestRole}>{role.name}</span>
                                                ))
                                            ) : (
                                                <span className={styles.requestEmpty}>Роль не выбрана</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.requestActions}>
                                        <button
                                            className={styles.acceptButton}
                                            type="button"
                                            onClick={() => handleAcceptRequest(member)}
                                            disabled={isBusy}
                                        >
                                            Принять
                                        </button>
                                        <button
                                            className={styles.rejectButton}
                                            type="button"
                                            onClick={() => handleRejectRequest(member)}
                                            disabled={isBusy}
                                        >
                                            Отклонить
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
            </div>
            )}

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
