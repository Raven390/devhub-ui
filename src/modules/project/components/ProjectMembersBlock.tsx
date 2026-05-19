import React, { useMemo } from 'react';
import styles from './ProjectMembersBlock.module.css';
import { Member, MemberStatus, Role } from '../../../types/domain';
import { Spinner } from '../../../components/ui/Spinner';

export interface ProjectMembersBlockProps {
    members: Member[];
    rolesCatalog: Role[];
    canEdit: boolean;
    currentUserId?: string;
    actionBusyId?: string | null;
    onRemoveMember?: (member: Member) => void;
    onLeaveProject?: (member: Member) => void;
}

const statusLabels: Record<MemberStatus, string> = {
    OWNER: 'Владелец',
    ACTIVE: 'Участник',
    INVITED: 'На рассмотрении',
    LEFT: 'Покинул',
    REMOVED: 'Исключен',
};

const visibleToUserStatuses = new Set<MemberStatus>(['OWNER', 'ACTIVE', 'INVITED']);

const ProjectMembersBlockComponent: React.FC<ProjectMembersBlockProps> = ({
    members,
    rolesCatalog,
    canEdit,
    currentUserId,
    actionBusyId,
    onRemoveMember,
    onLeaveProject,
}) => {
    const roleNameById = useMemo(
        () => new Map(rolesCatalog.map(role => [role.id, role.name])),
        [rolesCatalog],
    );

    const visibleMembers = useMemo(() => {
        return members.filter(member => (
            canEdit ||
            visibleToUserStatuses.has(member.status) ||
            member.user.id === currentUserId
        ));
    }, [canEdit, currentUserId, members]);

    return (
        <section className={styles.block} aria-label="Секция участников проекта">
            <div className={styles.header}>
                <h3 className={styles.title}>Участники</h3>
            </div>

            {visibleMembers.length > 0 ? (
                <ul className={styles.list} role="list">
                    {visibleMembers.map(member => {
                        const memberId = member.id ?? member.user.id;
                        const isBusy = actionBusyId === memberId;
                        const isCurrentUser = member.user.id === currentUserId;
                        const canLeave = isCurrentUser && member.status !== 'OWNER';
                        const canRemove = canEdit && !isCurrentUser && member.status === 'ACTIVE';
                        const initialsSource = member.user.name || member.user.email || member.user.id || 'U';
                        const initials = initialsSource.slice(0, 2).toUpperCase();
                        const roles = member.roles ?? [];

                        return (
                            <li key={memberId} className={styles.item}>
                                <div className={styles.user}>
                                    {member.user.avatarUrl ? (
                                        <img
                                            className={styles.avatar}
                                            src={member.user.avatarUrl}
                                            alt={member.user.name || 'user'}
                                            loading="lazy"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className={styles.avatarFallback} aria-hidden="true">
                                            {initials}
                                        </div>
                                    )}

                                    <div className={styles.meta}>
                                        <div className={styles.nameRow}>
                                            <span className={styles.name}>
                                                {member.user.name || member.user.email || 'User'}
                                            </span>
                                            <span className={`${styles.badge} ${styles[member.status.toLowerCase()]}`}>
                                                {statusLabels[member.status]}
                                            </span>
                                        </div>
                                        {member.user.email && (
                                            <span className={styles.email}>{member.user.email}</span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.rolesInline}>
                                    {roles.length > 0 ? (
                                        roles.map(role => (
                                            <span key={role.id} className={styles.chip}>
                                                {role.name || roleNameById.get(role.id) || `Role ${role.id}`}
                                            </span>
                                        ))
                                    ) : (
                                        <span className={styles.empty}>Роль не назначена</span>
                                    )}
                                </div>

                                <div className={styles.actions}>
                                    {canRemove && onRemoveMember && (
                                        <button
                                            className={styles.btnDanger}
                                            type="button"
                                            onClick={() => onRemoveMember(member)}
                                            disabled={isBusy}
                                        >
                                            Исключить
                                        </button>
                                    )}
                                    {canLeave && onLeaveProject && (
                                        <button
                                            className={styles.btnSecondary}
                                            type="button"
                                            onClick={() => onLeaveProject(member)}
                                            disabled={isBusy}
                                        >
                                            {member.status === 'INVITED' ? 'Отменить заявку' : 'Покинуть проект'}
                                        </button>
                                    )}
                                    {isBusy && <Spinner className={styles.rowSpinner} />}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className={styles.emptyState}>Пока нет участников</div>
            )}
        </section>
    );
};

export const ProjectMembersBlock = React.memo(ProjectMembersBlockComponent);
export default ProjectMembersBlock;
