import { AlertCircle, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectExplorerHeader } from '../components/ProjectExplorerHeader/ProjectExplorerHeader';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectCardSkeleton } from '../components/ProjectCardSkeleton';
import { EmptyState } from '../components/feed/EmptyState';
import { FilterSidebar } from '../components/feed/FilterSidebar';
import { Pagination } from '../components/feed/Pagination';
import { SearchBar } from '../components/feed/SearchBar';
import { useProjectFeedFilters } from '../hooks/useProjectFeedFilters';
import { useProjectList } from '../hooks/useProjectList';
import { useProjectReferences } from '../hooks/useProjectReferences';

const PAGE_SIZE = 12;
const SKELETON_COUNT = 9;

const toggleId = (ids: number[], id: number): number[] =>
  ids.includes(id) ? ids.filter((currentId) => currentId !== id) : [...ids, id];

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { filters, hasActiveFilters, updateFilters, resetFilters } = useProjectFeedFilters();
  const {
    technologies,
    roles,
    isLoading: isReferenceLoading,
    error: referenceError,
  } = useProjectReferences();
  const { projects, total, isLoading, isError, error, refetch } = useProjectList({
    page,
    size: PAGE_SIZE,
    search: filters.search,
    status: filters.status,
    technologyIds: filters.technologyIds,
    roleIds: filters.roleIds,
  });

  const totalPages = useMemo(() => Math.max(Math.ceil(total / PAGE_SIZE), 1), [total]);
  const filterSignature = useMemo(
    () =>
      [
        filters.search,
        filters.status,
        filters.technologyIds.join(','),
        filters.roleIds.join(','),
      ].join('|'),
    [filters.roleIds, filters.search, filters.status, filters.technologyIds],
  );

  useEffect(() => {
    setPage(0);
  }, [filterSignature]);

  const handleTechnologyToggle = useCallback(
    (technologyId: number) => {
      updateFilters({
        technologyIds: toggleId(filters.technologyIds, technologyId),
      });
    },
    [filters.technologyIds, updateFilters],
  );

  const handleRoleToggle = useCallback(
    (roleId: number) => {
      updateFilters({
        roleIds: toggleId(filters.roleIds, roleId),
      });
    },
    [filters.roleIds, updateFilters],
  );

  const handlePreviousPage = useCallback(() => {
    setPage((current) => Math.max(current - 1, 0));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((current) => current + 1);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <ProjectExplorerHeader />

      <main className="mx-auto w-full max-w-[1440px] px-5 pb-8 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <section className="flex flex-col gap-5 border-b border-[var(--border-dim)] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
              DevHub Projects
            </p>
            <h1 className="mt-3 text-[24px] font-medium leading-tight text-[var(--text-primary)]">
              Проекты
            </h1>
            <p className="mt-3 max-w-2xl text-[13px] leading-6 text-[var(--text-secondary)]">
              {total > 0
                ? `${total} проектов в каталоге`
                : 'Каталог проектных команд и учебных инициатив'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
              value={filters.search}
              onChange={(search) => updateFilters({ search })}
            />
            <button
              type="button"
              onClick={() => navigate('/projects/create')}
              className="inline-flex h-8 w-fit items-center gap-2 whitespace-nowrap rounded-md bg-white px-4 py-2 text-[13px] font-medium text-black transition duration-200 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/30"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Создать проект
            </button>
          </div>
        </section>

        <div className="grid gap-6 pt-7 lg:grid-cols-[260px_minmax(0,1fr)]">
          <FilterSidebar
            status={filters.status}
            technologyIds={filters.technologyIds}
            roleIds={filters.roleIds}
            technologies={technologies}
            roles={roles}
            isReferenceLoading={isReferenceLoading}
            referenceError={referenceError}
            hasActiveFilters={hasActiveFilters}
            onStatusChange={(status) => updateFilters({ status })}
            onTechnologyToggle={handleTechnologyToggle}
            onRoleToggle={handleRoleToggle}
            onReset={resetFilters}
          />

          <section>
            {isError ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-[var(--border-dim)] bg-[var(--bg-elevated)] px-6 text-center">
                <AlertCircle className="h-9 w-9 text-[var(--danger)]" aria-hidden="true" />
                <h2 className="mt-4 text-[18px] font-medium text-[var(--text-primary)]">
                  Не удалось загрузить проекты
                </h2>
                <p className="mt-2 max-w-md text-[13px] leading-6 text-[var(--text-secondary)]">
                  {error ?? 'Проверьте соединение с API и повторите запрос.'}
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-5 inline-flex items-center rounded-md border border-[var(--border-default)] bg-transparent px-4 py-2 text-[13px] font-medium text-[var(--text-primary)] transition duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--bg-overlay)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/25"
                >
                  Повторить
                </button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <ProjectCardSkeleton key={index} />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <EmptyState
                title={hasActiveFilters ? 'Ничего не найдено' : 'Проектов пока нет'}
                description={
                  hasActiveFilters
                    ? 'Попробуйте изменить поиск или снять часть фильтров.'
                    : 'Создайте первый проект и соберите команду вокруг понятной цели.'
                }
                actionLabel={hasActiveFilters ? 'Сбросить фильтры' : 'Создать проект'}
                onAction={hasActiveFilters ? resetFilters : () => navigate('/projects/create')}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={(projectId) => navigate(`/project/${projectId}`)}
                  />
                ))}
              </div>
            )}

            {!isError && total > PAGE_SIZE ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                isLoading={isLoading}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
              />
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProjectsPage;
