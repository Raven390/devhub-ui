import { ArrowUpRight, BriefcaseBusiness, CalendarDays, UsersRound } from 'lucide-react';
import type { CSSProperties } from 'react';
import { ProjectListItemDto, ProjectStatus, UUID } from '../types';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: ProjectListItemDto;
  onOpen?: (projectId: UUID) => void;
}

interface StatusView {
  label: string;
  className: string;
}

const statusView: Record<ProjectStatus, StatusView> = {
  DRAFT: {
    label: 'Черновик',
    className: styles.statusDraft,
  },
  ACTIVE: {
    label: 'Активен',
    className: styles.statusActive,
  },
  RECRUITING: {
    label: 'Набор команды',
    className: styles.statusRecruiting,
  },
  ARCHIVED: {
    label: 'Архив',
    className: styles.statusArchived,
  },
};

const relativeTime = (date: string): string => {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return 'Дата не указана';
  }

  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / 86400000);

  if (days <= 0) return 'сегодня';
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дней назад`;
  if (days < 30) return `${Math.floor(days / 7)} нед. назад`;

  return `${Math.floor(days / 30)} мес. назад`;
};

const getAvatarColor = (userId: UUID): string => {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = userId.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  return `hsl(${hue} 44% 34%)`;
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'U';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

export const ProjectCard = ({ project, onOpen }: ProjectCardProps) => {
  const status = statusView[project.status];
  const projectType = project.typeName ?? project.type;
  const technologies = project.technologyNames ?? project.technologies ?? [];
  const roles = project.roleNames ?? project.roles ?? [];
  const membersCount = project.members?.length ?? 0;
  const visibleTechnologies = technologies.slice(0, 4);
  const hiddenTechnologiesCount = Math.max(technologies.length - visibleTechnologies.length, 0);
  const description = project.shortDescription?.trim();
  const hasProjectMeta = visibleTechnologies.length > 0 || roles.length > 0;
  const ownerName = project.owner.name.trim() || project.owner.email;
  const avatarStyle = {
    backgroundColor: getAvatarColor(project.owner.id),
  } satisfies CSSProperties;

  return (
    <article className={styles.wrapper}>
      <button
        type="button"
        onClick={() => onOpen?.(project.id)}
        className={styles.card}
        aria-label={`Открыть проект ${project.name}`}
      >
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <p className={styles.typeLabel}>
              {projectType?.name ?? 'Project'}
            </p>
            <h2 className={styles.title}>{project.name}</h2>
          </div>

          <span className={`${styles.statusBadge} ${status.className}`}>
            <span className={styles.statusDot} />
            {status.label}
          </span>
        </div>

        {description ? <p className={styles.description}>{description}</p> : null}

        {hasProjectMeta ? (
          <div className={styles.projectMeta}>
            {visibleTechnologies.length > 0 ? (
              <div className={styles.techList}>
                {visibleTechnologies.map((technology) => (
                  <span
                    key={technology.id}
                    className={styles.techBadge}
                    title={technology.name}
                  >
                    {technology.name}
                  </span>
                ))}
                {hiddenTechnologiesCount > 0 && (
                  <span className={`${styles.techBadge} ${styles.techOverflow}`}>
                    +{hiddenTechnologiesCount}
                  </span>
                )}
              </div>
            ) : null}

            {roles.length > 0 ? (
              <div className={styles.rolesLine}>
                <BriefcaseBusiness className={styles.metaIcon} aria-hidden="true" />
                <span className={styles.rolesText}>
                  Нужны: {roles.map((role) => role.name).join(' · ')}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={styles.footer}>
          <div className={styles.owner}>
            <span className={styles.avatar} style={avatarStyle} aria-hidden="true">
              {getInitials(ownerName)}
            </span>
            <span className={styles.ownerName} title={ownerName}>
              {ownerName}
            </span>
          </div>

          <div className={styles.footerMeta}>
            <span className={styles.metaItem}>
              <UsersRound className={styles.metaIcon} aria-hidden="true" />
              {membersCount}
            </span>
            <span className={styles.metaSeparator}>·</span>
            <span className={styles.metaItem}>
              <CalendarDays className={styles.metaIcon} aria-hidden="true" />
              {relativeTime(project.createdAt)}
            </span>
            <ArrowUpRight className={styles.externalIcon} aria-hidden="true" />
          </div>
        </div>
      </button>
    </article>
  );
};
