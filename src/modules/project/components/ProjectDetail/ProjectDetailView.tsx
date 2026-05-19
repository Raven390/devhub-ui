import React, { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Pencil, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Member, MemberStatus, Project, Role, Status, Technology, User } from '../../../../types/domain';
import { RoleSelectModal } from '../RoleSelectModal';
import styles from './ProjectDetailView.module.css';

interface ProjectDetailViewProps {
  project: Project;
  canEdit: boolean;
  currentUserIdentityKeys: string[];
  memberActionBusyId?: string | null;
  memberActionError?: string | null;
  onJoin: (roleIds: number[]) => Promise<void>;
  onLeave: (member: Member) => Promise<void>;
}

const statusLabels: Record<Status, string> = {
  DRAFT: 'Черновик',
  ACTIVE: 'Активен',
  RECRUITING: 'Набор команды',
  ARCHIVED: 'Архив',
};

const memberStatusLabels: Record<MemberStatus, string> = {
  OWNER: 'OWNER',
  ACTIVE: 'ACTIVE',
  INVITED: 'INVITED',
  LEFT: 'LEFT',
  REMOVED: 'REMOVED',
};

const visibleMemberStatuses = new Set<MemberStatus>(['OWNER', 'ACTIVE', 'INVITED']);
const activeMembershipStatuses = new Set<MemberStatus>(['OWNER', 'ACTIVE', 'INVITED']);

const getInitials = (value?: string): string => {
  const normalizedValue = value?.trim();
  if (!normalizedValue) return 'U';

  return normalizedValue.slice(0, 2).toUpperCase();
};

const getUserName = (user: User): string => user.name || user.email || 'User';

const formatCreatedDate = (value?: string): string => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date
    .toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .replace(/\s?г\.$/, '');
};

const memberKey = (member: Member): string => member.id ?? member.user.id;

const matchesCurrentUser = (member: Member, identityKeys: string[]): boolean => (
  identityKeys.some((identityKey) => (
    identityKey === member.user.id ||
    identityKey === member.user.email ||
    identityKey === member.user.name
  ))
);

const StatusBadge: React.FC<{ status: Status; compact?: boolean }> = ({ status, compact = false }) => (
  <span className={`${styles.statusBadge} ${styles[status.toLowerCase()]} ${compact ? styles.compactStatus : ''}`}>
    <span className={styles.statusDot} aria-hidden="true" />
    {statusLabels[status]}
  </span>
);

const ChipList: React.FC<{ items: Array<Technology | Role>; emptyLabel?: string }> = ({
  items,
  emptyLabel = '—',
}) => {
  if (items.length === 0) {
    return <span className={styles.dash}>{emptyLabel}</span>;
  }

  return (
    <div className={styles.chips}>
      {items.map((item) => (
        <span key={item.id} className={styles.chip}>
          {item.name}
        </span>
      ))}
    </div>
  );
};

const Avatar: React.FC<{ user: User; size?: 'sm' | 'md' }> = ({ user, size = 'md' }) => {
  const name = getUserName(user);
  const className = size === 'sm' ? styles.avatarSmall : styles.avatar;

  if (user.avatarUrl) {
    return (
      <img
        className={className}
        src={user.avatarUrl}
        alt={name}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span className={`${className} ${styles.avatarFallback}`} aria-hidden="true">
      {getInitials(name)}
    </span>
  );
};

const TeamMemberRow: React.FC<{ member: Member }> = ({ member }) => {
  const roles = member.roles ?? [];
  const primaryRoleLabel = member.status === 'OWNER'
    ? 'Влад.'
    : roles.map((role) => role.name).join(', ') || 'Роль не выбрана';

  return (
    <li className={styles.memberRow}>
      <div className={styles.memberIdentity}>
        <Avatar user={member.user} size="sm" />
        <span className={styles.memberName}>{getUserName(member.user)}</span>
        <span className={styles.memberDivider}>·</span>
        <span className={styles.memberRole}>{primaryRoleLabel}</span>
      </div>
      <span className={`${styles.memberBadge} ${styles[member.status.toLowerCase()]}`}>
        {memberStatusLabels[member.status]}
      </span>
    </li>
  );
};

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  canEdit,
  currentUserIdentityKeys,
  memberActionBusyId,
  memberActionError,
  onJoin,
  onLeave,
}) => {
  const navigate = useNavigate();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const description = project.description?.trim();
  const visibleMembers = useMemo(
    () => (project.members ?? []).filter((member) => visibleMemberStatuses.has(member.status)),
    [project.members],
  );
  const currentMember = useMemo(
    () => (project.members ?? []).find((member) => matchesCurrentUser(member, currentUserIdentityKeys)),
    [currentUserIdentityKeys, project.members],
  );
  const isCurrentUserMember = Boolean(
    currentMember && activeMembershipStatuses.has(currentMember.status),
  );
  const canLeaveProject = Boolean(
    currentMember &&
    currentMember.status !== 'OWNER' &&
    activeMembershipStatuses.has(currentMember.status),
  );
  const showJoinButton = Boolean(
    currentUserIdentityKeys.length > 0 &&
    project.status === 'RECRUITING' &&
    !isCurrentUserMember,
  );
  const showLeaveButton = project.status === 'RECRUITING' && canLeaveProject;
  const currentMemberBusyId = currentMember ? memberKey(currentMember) : null;
  const isJoinBusy = memberActionBusyId === 'join';
  const isLeaveBusy = Boolean(currentMemberBusyId && memberActionBusyId === currentMemberBusyId);

  const handleJoinConfirm = useCallback(async (roleIds: number[]) => {
    await onJoin(roleIds);
  }, [onJoin]);

  const handleLeave = useCallback(() => {
    if (!currentMember) return;

    const confirmed = window.confirm('Вы уверены, что хотите покинуть проект? Это действие нельзя отменить.');
    if (!confirmed) return;

    void onLeave(currentMember);
  }, [currentMember, onLeave]);

  return (
    <article className={styles.container}>
      <header className={styles.topbar}>
        <button
          className={styles.breadcrumb}
          type="button"
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft className={styles.breadcrumbIcon} aria-hidden="true" />
          Проекты
        </button>

        {canEdit ? (
          <button
            className={styles.editButton}
            type="button"
            disabled
            title="Редактирование проекта будет добавлено отдельной задачей"
          >
            <Pencil className={styles.editIcon} aria-hidden="true" />
            Редактировать
          </button>
        ) : null}
      </header>

      <div className={styles.layout}>
        <div className={styles.content}>
          <section className={styles.hero} aria-labelledby="project-title">
            <h1 id="project-title" className={styles.title}>
              {project.name}
            </h1>
            <StatusBadge status={project.status} />
          </section>

          {description ? (
            <section className={styles.section}>
              <h2 className={styles.sectionLabel}>О проекте</h2>
              <p className={styles.description}>{description}</p>
            </section>
          ) : null}

          <section className={styles.section}>
            <h2 className={styles.sectionLabel}>Технологии</h2>
            <ChipList items={project.technologies ?? []} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionLabel}>Нужные роли</h2>
            {(project.roles ?? []).length > 0 ? (
              <ul className={styles.roleList}>
                {project.roles.map((role) => (
                  <li key={role.id} className={styles.roleItem}>
                    {role.name}
                  </li>
                ))}
              </ul>
            ) : (
              <span className={styles.dash}>—</span>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionLabel}>Команда</h2>
            <div className={styles.teamPanel}>
              {visibleMembers.length > 0 ? (
                <ul className={styles.memberList}>
                  {visibleMembers.map((member) => (
                    <TeamMemberRow key={memberKey(member)} member={member} />
                  ))}
                </ul>
              ) : (
                <div className={styles.emptyTeam}>
                  <Users className={styles.emptyIcon} aria-hidden="true" />
                  <span>Нет участников</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className={styles.sidebar} aria-label="Сводка проекта">
          <section className={styles.sidebarSection}>
            <h2 className={styles.sectionLabel}>Статус</h2>
            <StatusBadge status={project.status} compact />
          </section>

          <section className={styles.sidebarSection}>
            <h2 className={styles.sectionLabel}>Владелец</h2>
            <div className={styles.ownerRow}>
              <Avatar user={project.owner} size="sm" />
              <span>{getUserName(project.owner)}</span>
            </div>
          </section>

          <section className={styles.sidebarSection}>
            <h2 className={styles.sectionLabel}>Технологии</h2>
            <ChipList items={project.technologies ?? []} />
          </section>

          <section className={styles.sidebarSection}>
            <h2 className={styles.sectionLabel}>Нужные роли</h2>
            <ChipList items={project.roles ?? []} />
          </section>

          <section className={styles.sidebarSection}>
            <h2 className={styles.sectionLabel}>Тип проекта</h2>
            <p className={styles.sidebarValue}>{project.type?.name ?? '—'}</p>
          </section>

          {(showJoinButton || showLeaveButton || memberActionError) ? (
            <div className={styles.sidebarDivider} />
          ) : null}

          {showJoinButton ? (
            <button
              className={styles.primaryAction}
              type="button"
              onClick={() => setIsRoleModalOpen(true)}
              disabled={isJoinBusy}
            >
              {isJoinBusy ? 'Отправляем...' : 'Вступить в проект'}
              {!isJoinBusy ? <ArrowRight className={styles.actionIcon} aria-hidden="true" /> : null}
            </button>
          ) : null}

          {showLeaveButton ? (
            <button
              className={styles.leaveAction}
              type="button"
              onClick={handleLeave}
              disabled={isLeaveBusy}
            >
              {isLeaveBusy ? 'Выходим...' : 'Покинуть проект'}
            </button>
          ) : null}

          {memberActionError ? (
            <p className={styles.actionError} role="alert">{memberActionError}</p>
          ) : null}

          <p className={styles.createdAt}>Создан {formatCreatedDate(project.createdAt)}</p>
        </aside>
      </div>

      {isRoleModalOpen ? (
        <RoleSelectModal
          roles={project.roles ?? []}
          onConfirm={handleJoinConfirm}
          onClose={() => setIsRoleModalOpen(false)}
        />
      ) : null}
    </article>
  );
};
