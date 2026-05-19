import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../api/http';
import { ListProjectResponse, ProjectListItemDto, ProjectStatus } from '../types';

export interface UseProjectListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: ProjectStatus | 'ALL';
  technologyIds?: number[];
  roleIds?: number[];
}

export interface UseProjectListResult {
  projects: ProjectListItemDto[];
  total: number;
  page: number;
  size: number;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ProjectListState {
  projects: ProjectListItemDto[];
  total: number;
  page: number;
  size: number;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 12;
const EMPTY_FILTER_IDS: number[] = [];

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Не удалось загрузить проекты';
};

export const useProjectList = ({
  page = DEFAULT_PAGE,
  size = DEFAULT_SIZE,
  search = '',
  status,
  technologyIds = EMPTY_FILTER_IDS,
  roleIds = EMPTY_FILTER_IDS,
}: UseProjectListParams = {}): UseProjectListResult => {
  const [state, setState] = useState<ProjectListState>({
    projects: [],
    total: 0,
    page,
    size,
    isLoading: true,
    isError: false,
    error: null,
  });

  const queryString = useMemo(() => {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    const normalizedSearch = search.trim();

    if (normalizedSearch) {
      query.set('search', normalizedSearch);
    }

    if (status && status !== 'ALL') {
      query.set('status', status);
    }

    technologyIds.forEach((id) => {
      query.append('technologyIds', String(id));
    });

    roleIds.forEach((id) => {
      query.append('roleIds', String(id));
    });

    return query.toString();
  }, [page, roleIds, search, size, status, technologyIds]);

  const fetchProjectList = useCallback(
    async (signal?: AbortSignal) => {
      setState((current) => ({
        ...current,
        page,
        size,
        isLoading: true,
        isError: false,
        error: null,
      }));

      try {
        const response = await apiFetch<ListProjectResponse>(
          `/projects?${queryString}`,
          { method: 'GET', signal },
        );

        if (signal?.aborted) {
          return;
        }

        setState({
          projects: response.projects,
          total: response.total,
          page: response.page,
          size: response.size,
          isLoading: false,
          isError: false,
          error: null,
        });
      } catch (error: unknown) {
        if (signal?.aborted) {
          return;
        }

        setState({
          projects: [],
          total: 0,
          page,
          size,
          isLoading: false,
          isError: true,
          error: getErrorMessage(error),
        });
      }
    },
    [page, queryString, size],
  );

  useEffect(() => {
    const controller = new AbortController();

    void fetchProjectList(controller.signal);

    return () => controller.abort();
  }, [fetchProjectList]);

  return {
    projects: state.projects,
    total: state.total,
    page: state.page,
    size: state.size,
    isLoading: state.isLoading,
    isError: state.isError,
    error: state.error,
    refetch: () => fetchProjectList(),
  };
};
