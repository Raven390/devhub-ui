import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../../auth/AuthContext';
import { SkeletonField } from '../../../components/ui/SkeletonField';
import ProjectExplorerHeader from '../components/ProjectExplorerHeader/ProjectExplorerHeader';
import { ProjectDetailView } from '../components/ProjectDetail/ProjectDetailView';
import { useProjectDetail } from '../hooks/useProjectDetail';
import styles from './ProjectDetailPage.module.css';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    project,
    isLoading,
    isError,
    error,
    memberActionBusyId,
    memberActionError,
    join,
    leave,
  } = useProjectDetail(id);

  const currentUserIdentityKeys = [
    user?.businessId,
    user?.id,
    user?.email,
    user?.username,
    user?.displayName,
  ].filter((value): value is string => Boolean(value));
  const isOwner = Boolean(
    project && currentUserIdentityKeys.some((identityKey) => (
      identityKey === project.owner.id ||
      identityKey === project.owner.email ||
      identityKey === project.owner.name
    )),
  );

  return (
    <div className={styles.page}>
      <ProjectExplorerHeader />
      <main className={styles.main}>
        {authLoading || isLoading ? (
          <ProjectDetailSkeleton />
        ) : isError || !project ? (
          <section className={styles.errorState} role="alert">
            <AlertCircle className={styles.errorIcon} aria-hidden="true" />
            <h1 className={styles.errorTitle}>Не удалось загрузить проект</h1>
            <p className={styles.errorText}>{error ?? 'Проект не найден'}</p>
            <button
              className={styles.errorButton}
              type="button"
              onClick={() => navigate('/projects')}
            >
              Вернуться к проектам
            </button>
          </section>
        ) : (
          <ProjectDetailView
            project={project}
            canEdit={isOwner}
            currentUserIdentityKeys={currentUserIdentityKeys}
            memberActionBusyId={memberActionBusyId}
            memberActionError={memberActionError}
            onJoin={join}
            onLeave={leave}
          />
        )}
      </main>
    </div>
  );
};

const ProjectDetailSkeleton: React.FC = () => (
  <section className={styles.skeleton} aria-label="Загрузка проекта">
    <SkeletonField width={96} height={18} style={{ marginBottom: 28 }} />
    <div className={styles.skeletonGrid}>
      <div>
        <SkeletonField width={320} height={34} style={{ marginBottom: 12 }} />
        <SkeletonField width={140} height={24} style={{ marginBottom: 28 }} />
        <SkeletonField width="100%" height={1} style={{ marginBottom: 24 }} />
        <SkeletonField width={92} height={13} style={{ marginBottom: 12 }} />
        <SkeletonField width="92%" height={20} style={{ marginBottom: 8 }} />
        <SkeletonField width="78%" height={20} style={{ marginBottom: 28 }} />
        <SkeletonField width="100%" height={1} style={{ marginBottom: 24 }} />
        <SkeletonField width={110} height={13} style={{ marginBottom: 12 }} />
        <div className={styles.skeletonChips}>
          <SkeletonField width={58} height={22} />
          <SkeletonField width={72} height={22} />
          <SkeletonField width={62} height={22} />
        </div>
      </div>
      <aside className={styles.skeletonAside}>
        <SkeletonField width="100%" height={26} style={{ marginBottom: 20 }} />
        <SkeletonField width="72%" height={18} style={{ marginBottom: 24 }} />
        <SkeletonField width="100%" height={34} style={{ marginTop: 28 }} />
      </aside>
    </div>
  </section>
);
