import { ArrowUpRight, CalendarDays, Code2, UserRound, UsersRound } from 'lucide-react';
import { ProjectListItemDto, ProjectStatus, UUID } from '../types';

interface ProjectCardProps {
  project: ProjectListItemDto;
  onOpen?: (projectId: UUID) => void;
}

interface StatusView {
  label: string;
  badgeClassName: string;
  dotClassName: string;
}

const statusView: Record<ProjectStatus, StatusView> = {
  DRAFT: {
    label: 'Черновик',
    badgeClassName: 'border-amber-300/15 bg-amber-300/10 text-amber-100',
    dotClassName: 'bg-amber-300',
  },
  ACTIVE: {
    label: 'Активен',
    badgeClassName: 'border-emerald-300/15 bg-emerald-300/10 text-emerald-100',
    dotClassName: 'bg-emerald-300',
  },
  RECRUITING: {
    label: 'Набор',
    badgeClassName: 'border-sky-300/15 bg-sky-300/10 text-sky-100',
    dotClassName: 'bg-sky-300',
  },
  ARCHIVED: {
    label: 'Архив',
    badgeClassName: 'border-zinc-300/10 bg-zinc-400/10 text-zinc-300',
    dotClassName: 'bg-zinc-400',
  },
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Дата не указана';
  }

  return dateFormatter.format(date);
};

export const ProjectCard = ({ project, onOpen }: ProjectCardProps) => {
  const status = statusView[project.status];
  const technologies = project.technologies ?? [];
  const roles = project.roles ?? [];
  const membersCount = project.members?.length ?? 0;
  const visibleTechnologies = technologies.slice(0, 4);
  const hiddenTechnologiesCount = Math.max(technologies.length - visibleTechnologies.length, 0);
  const visibleRoles = roles.slice(0, 2);
  const hiddenRolesCount = Math.max(roles.length - visibleRoles.length, 0);
  const description =
    project.shortDescription?.trim() || 'Команда пока не добавила краткое описание проекта.';

  return (
    <article className="h-full">
      <button
        type="button"
        onClick={() => onOpen?.(project.id)}
        className="group flex h-full min-h-[312px] w-full flex-col rounded-lg border border-white/[0.08] bg-[#111216] p-5 text-left shadow-sm outline-none transition duration-300 ease-out hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-[#14161b] hover:shadow-[0_18px_44px_rgba(0,0,0,0.26)] focus-visible:border-sky-300/40 focus-visible:ring-2 focus-visible:ring-sky-300/20"
        aria-label={`Открыть проект ${project.name}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              {project.type?.name ?? 'Project'}
            </p>
            <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-6 text-zinc-50">
              {project.name}
            </h2>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${status.badgeClassName}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`} />
            {status.label}
          </span>
        </div>

        <p className="mt-4 line-clamp-3 min-h-[66px] text-sm leading-6 text-zinc-400">
          {description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {visibleTechnologies.map((technology) => (
            <span
              key={technology.id}
              className="inline-flex max-w-[148px] items-center gap-1.5 truncate rounded-md border border-sky-200/10 bg-sky-200/[0.07] px-2.5 py-1 text-xs font-medium text-sky-100/90"
              title={technology.name}
            >
              <Code2 className="h-3.5 w-3.5 shrink-0 text-sky-200/70" aria-hidden="true" />
              <span className="truncate">{technology.name}</span>
            </span>
          ))}
          {hiddenTechnologiesCount > 0 && (
            <span className="inline-flex rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-400">
              +{hiddenTechnologiesCount}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {visibleRoles.map((role) => (
            <span
              key={role.id}
              className="inline-flex max-w-[168px] truncate rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-300"
              title={role.name}
            >
              <span className="truncate">{role.name}</span>
            </span>
          ))}
          {hiddenRolesCount > 0 && (
            <span className="inline-flex rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-500">
              +{hiddenRolesCount}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/[0.07] pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] text-zinc-300">
              <UserRound className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-200">{project.owner.name}</p>
              <p className="truncate text-xs text-zinc-500">{project.owner.email}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
              {membersCount}
            </span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(project.createdAt)}
            </span>
            <ArrowUpRight
              className="h-4 w-4 text-zinc-500 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-200"
              aria-hidden="true"
            />
          </div>
        </div>
      </button>
    </article>
  );
};
