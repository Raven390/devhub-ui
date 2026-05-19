import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchProjectById } from '../api/ProjectsApi';
import { joinProject, removeProjectMember } from '../api/membership';
import { Member, MemberStatus, Project } from '../../../types/domain';

interface UseProjectDetailResult {
  project: Project | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  memberActionBusyId: string | null;
  memberActionError: string | null;
  join: (roleIds: number[]) => Promise<void>;
  leave: (member: Member) => Promise<void>;
}

const inactiveMemberStatuses = new Set<MemberStatus>(['LEFT', 'REMOVED']);

const getMemberIdentity = (member: Member): string => member.id ?? member.user.id;

const upsertMember = (members: Member[], nextMember: Member): Member[] => {
  const hasExistingMember = members.some((member) => (
    (nextMember.id && member.id === nextMember.id) || member.user.id === nextMember.user.id
  ));

  if (!hasExistingMember) {
    return [...members, nextMember];
  }

  return members.map((member) => (
    (nextMember.id && member.id === nextMember.id) || member.user.id === nextMember.user.id
      ? nextMember
      : member
  ));
};

export const useProjectDetail = (projectId?: string): UseProjectDetailResult => {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberActionBusyId, setMemberActionBusyId] = useState<string | null>(null);
  const [memberActionError, setMemberActionError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!projectId) {
      setProject(null);
      setIsLoading(false);
      setError('Не указан id проекта');
      return () => {
        mounted = false;
      };
    }

    setIsLoading(true);
    setError(null);
    setMemberActionError(null);

    fetchProjectById(projectId)
      .then((loadedProject) => {
        if (!mounted) return;
        setProject(loadedProject);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setProject(null);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных проекта');
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [projectId]);

  const join = useCallback(async (roleIds: number[]) => {
    if (!projectId) return;

    setMemberActionBusyId('join');
    setMemberActionError(null);
    try {
      const member = await joinProject(projectId, roleIds);
      setProject((currentProject) => (
        currentProject
          ? { ...currentProject, members: upsertMember(currentProject.members ?? [], member) }
          : currentProject
      ));
    } catch (err) {
      setMemberActionError(err instanceof Error ? err.message : 'Не удалось отправить заявку');
      throw err;
    } finally {
      setMemberActionBusyId(null);
    }
  }, [projectId]);

  const leave = useCallback(async (member: Member) => {
    if (!projectId || inactiveMemberStatuses.has(member.status)) return;

    if (!member.id) {
      setMemberActionError('Для этой записи участника не получен id от сервера');
      return;
    }

    const busyId = getMemberIdentity(member);
    setMemberActionBusyId(busyId);
    setMemberActionError(null);
    try {
      await removeProjectMember(projectId, member.id);
      const nextMember: Member = { ...member, status: 'LEFT' };
      setProject((currentProject) => (
        currentProject
          ? { ...currentProject, members: upsertMember(currentProject.members ?? [], nextMember) }
          : currentProject
      ));
    } catch (err) {
      setMemberActionError(err instanceof Error ? err.message : 'Не удалось покинуть проект');
    } finally {
      setMemberActionBusyId(null);
    }
  }, [projectId]);

  return useMemo(() => ({
    project,
    isLoading,
    isError: Boolean(error),
    error,
    memberActionBusyId,
    memberActionError,
    join,
    leave,
  }), [
    error,
    isLoading,
    join,
    leave,
    memberActionBusyId,
    memberActionError,
    project,
  ]);
};
