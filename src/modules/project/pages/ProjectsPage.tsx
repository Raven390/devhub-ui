import { AlertCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectExplorerHeader } from '../components/ProjectExplorerHeader/ProjectExplorerHeader';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectCardSkeleton } from '../components/ProjectCardSkeleton';
import { useProjectList } from '../hooks/useProjectList';

const PAGE_SIZE = 12;
const SKELETON_COUNT = 9;

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { projects, total, isLoading, isError, error, refetch } = useProjectList({
    page,
    size: PAGE_SIZE,
  });

  const totalPages = useMemo(() => Math.max(Math.ceil(total / PAGE_SIZE), 1), [total]);
  const canGoBack = page > 0 && !isLoading;
  const canGoForward = page + 1 < totalPages && !isLoading;

  return (
    <div className="min-h-screen bg-[#08090c] text-zinc-100">
      <ProjectExplorerHeader />

      <main className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
        <section className="flex flex-col gap-5 border-b border-white/[0.07] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              DevHub Projects
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-zinc-50 sm:text-4xl">
              Проекты
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              {total > 0
                ? `${total} проектов в каталоге`
                : 'Каталог проектных команд и учебных инициатив'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/projects/create')}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-white/[0.08] bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 shadow-sm transition duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/30"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Создать проект
          </button>
        </section>

        <section className="pt-7">
          {isError ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-6 text-center">
              <AlertCircle className="h-9 w-9 text-rose-300" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-zinc-50">Не удалось загрузить проекты</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
                {error ?? 'Проверьте соединение с API и повторите запрос.'}
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-5 inline-flex items-center rounded-md border border-white/[0.1] bg-white/[0.06] px-4 py-2 text-sm font-medium text-zinc-100 transition duration-200 hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/25"
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
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] px-6 text-center">
              <h2 className="text-lg font-semibold text-zinc-50">Проектов пока нет</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
                Создайте первый проект и соберите команду вокруг понятной цели.
              </p>
              <button
                type="button"
                onClick={() => navigate('/projects/create')}
                className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-950 transition duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/30"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Создать проект
              </button>
            </div>
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
        </section>

        {!isError && total > PAGE_SIZE && (
          <nav className="mt-7 flex items-center justify-between border-t border-white/[0.07] pt-5">
            <p className="text-sm text-zinc-500">
              Страница {page + 1} из {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canGoBack}
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition duration-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/25"
                aria-label="Предыдущая страница"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled={!canGoForward}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.04] text-zinc-300 transition duration-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/25"
                aria-label="Следующая страница"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </nav>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;
