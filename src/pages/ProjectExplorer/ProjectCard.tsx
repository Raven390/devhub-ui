import React from 'react';
import styles from './ProjectCard.module.css';
import { ProjectSummary } from "../../types/domain";
import { useNavigate } from "react-router-dom";

const statusLabels: Record<string, string> = {
    RECRUITING: 'recruiting',
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    DRAFT: 'draft',
};

const statusColors: Record<string, string> = {
    RECRUITING: '#228bf3',
    ACTIVE: '#44cf9b',
    ARCHIVED: '#757e98',
    DRAFT: '#8a93ac',
};

interface ProjectCardProps {
    project: ProjectSummary;
    onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
    const navigate = useNavigate();

    const techs = project.technologies?.map(t => t.name) || [];
    const roles = project.roles?.map(r => r.name) || [];
    const typeName = project.type?.name || '';

    const visibleTechs = techs.slice(0, 3);
    const techMore = techs.length > 3 ? techs.length - 3 : 0;

    const visibleRoles = roles.slice(0, 2);
    const roleMore = roles.length > 2 ? roles.length - 2 : 0;

    return (
        <div
            className={styles.card}
            tabIndex={0}
            onClick={onClick}
            role="button"
            aria-label={`Открыть проект ${project.name}`}
        >
            {/* Верхний блок: название и статус */}
            <div className={styles.headerRow}>
                <span className={styles.title} title={project.name}>{project.name}</span>
                {project.status && (
                    <span
                        className={styles.status}
                        style={{ background: statusColors[project.status] || '#757e99' }}
                    >
                        {statusLabels[project.status] || project.status}
                    </span>
                )}
            </div>

            {/* Теги технологий */}
            <div className={styles.labelsRow}>
                {visibleTechs.map((tech) => (
                    <span className={styles.tech} key={tech}>{tech}</span>
                ))}
                {techMore > 0 && <span className={styles.techMore}>+{techMore}</span>}
            </div>

            {/* Теги ролей */}
            <div className={styles.rolesRow}>
                {visibleRoles.map((role) => (
                    <span className={styles.role} key={role}>{role}</span>
                ))}
                {roleMore > 0 && <span className={styles.roleMore}>+{roleMore}</span>}
            </div>

            {/* Описание */}
            <div className={styles.descBox}>
                <div
                    className={styles.desc}
                    title={
                        project.shortDescription && project.shortDescription.length > 280
                            ? project.shortDescription
                            : undefined
                    }
                >
                    {project.shortDescription && project.shortDescription.length > 280
                        ? <span>{project.shortDescription.slice(0, 200)}…</span>
                        : <span>{project.shortDescription}</span>}
                </div>
            </div>

            {/* Футер */}
            <div className={styles.cardFooter}>
                <div className={styles.owner}>
                    {project.owner?.avatarUrl
                        ? <img
                            src={project.owner.avatarUrl}
                            className={styles.avatar}
                            alt={project.owner.name}
                            title={project.owner.name}
                        />
                        : <div
                            className={styles.avatarFallback}
                            title={project.owner?.name}
                        >
                            {project.owner?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    }
                    <span className={styles.ownerName}>{project.owner?.name || 'Unknown'}</span>
                </div>
                <div className={styles.members}>
                    <svg width={18} height={18} className={styles.membersIcon}>
                        <circle cx={9} cy={9} r={9} fill="#228bf3" />
                    </svg>
                    <span>{project.members?.length ?? 0}</span>
                </div>
                {typeName && (
                    <span className={styles.typeBadge}>
                        {typeName}
                    </span>
                )}
                <button
                    className={styles.detailsBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/project/${project.id}`);
                    }}
                    tabIndex={0}
                >
                    Подробнее
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
