import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProjectStatus } from '../types';

export type ProjectFeedStatus = ProjectStatus | 'ALL';

export interface ProjectFeedFilters {
  search: string;
  status: ProjectFeedStatus;
  technologyIds: number[];
  roleIds: number[];
}

export const DEFAULT_FEED_STATUS: ProjectFeedStatus = 'RECRUITING';

const validStatuses = new Set<ProjectFeedStatus>([
  'ALL',
  'DRAFT',
  'ACTIVE',
  'RECRUITING',
  'ARCHIVED',
]);

const toPositiveInteger = (value: string): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseIds = (params: URLSearchParams, key: string): number[] => {
  const ids = params
    .getAll(key)
    .flatMap((value) => value.split(','))
    .map((value) => toPositiveInteger(value.trim()))
    .filter((value): value is number => value !== null);

  return Array.from(new Set(ids));
};

const parseStatus = (value: string | null): ProjectFeedStatus => {
  if (value && validStatuses.has(value as ProjectFeedStatus)) {
    return value as ProjectFeedStatus;
  }

  return DEFAULT_FEED_STATUS;
};

const serializeFilters = (filters: ProjectFeedFilters): URLSearchParams => {
  const params = new URLSearchParams();
  const search = filters.search.trim();

  if (search) {
    params.set('search', search);
  }

  if (filters.status !== DEFAULT_FEED_STATUS) {
    params.set('status', filters.status);
  }

  filters.technologyIds.forEach((id) => {
    params.append('technologyIds', String(id));
  });

  filters.roleIds.forEach((id) => {
    params.append('roleIds', String(id));
  });

  return params;
};

export const hasActiveFeedFilters = (filters: ProjectFeedFilters): boolean =>
  filters.search.trim().length > 0 ||
  filters.status !== DEFAULT_FEED_STATUS ||
  filters.technologyIds.length > 0 ||
  filters.roleIds.length > 0;

export const useProjectFeedFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<ProjectFeedFilters>(
    () => ({
      search: searchParams.get('search') ?? '',
      status: parseStatus(searchParams.get('status')),
      technologyIds: parseIds(searchParams, 'technologyIds'),
      roleIds: parseIds(searchParams, 'roleIds'),
    }),
    [searchParams],
  );

  const updateFilters = useCallback(
    (patch: Partial<ProjectFeedFilters>) => {
      const nextFilters: ProjectFeedFilters = {
        ...filters,
        ...patch,
      };

      setSearchParams(serializeFilters(nextFilters), { replace: false });
    },
    [filters, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(serializeFilters({
      search: '',
      status: DEFAULT_FEED_STATUS,
      technologyIds: [],
      roleIds: [],
    }), { replace: false });
  }, [setSearchParams]);

  return {
    filters,
    hasActiveFilters: hasActiveFeedFilters(filters),
    updateFilters,
    resetFilters,
  };
};
