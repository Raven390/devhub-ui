import { useCallback, useEffect, useState } from 'react';
import { fetchRoles, fetchTechnologies } from '../api/ReferenceApi';
import { RoleDto, TechnologyDto } from '../types';

interface ProjectReferencesState {
  technologies: TechnologyDto[];
  roles: RoleDto[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Не удалось загрузить справочники';
};

export const useProjectReferences = () => {
  const [state, setState] = useState<ProjectReferencesState>({
    technologies: [],
    roles: [],
    isLoading: true,
    isError: false,
    error: null,
  });

  const loadReferences = useCallback(async () => {
    setState((current) => ({
      ...current,
      isLoading: true,
      isError: false,
      error: null,
    }));

    try {
      const [technologies, roles] = await Promise.all([
        fetchTechnologies(),
        fetchRoles(),
      ]);

      setState({
        technologies,
        roles,
        isLoading: false,
        isError: false,
        error: null,
      });
    } catch (error: unknown) {
      setState({
        technologies: [],
        roles: [],
        isLoading: false,
        isError: true,
        error: getErrorMessage(error),
      });
    }
  }, []);

  useEffect(() => {
    void loadReferences();
  }, [loadReferences]);

  return {
    ...state,
    refetch: loadReferences,
  };
};
