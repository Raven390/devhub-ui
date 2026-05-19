import React, { useEffect, useState, useRef, useCallback } from 'react';
import styles from './ProjectExplorer.module.css';
import { ProjectExplorerHeader } from '../ProjectExplorerHeader/ProjectExplorerHeader';
import { ProjectCard } from './ProjectCard';
import { fetchProjects } from '../../api/ProjectsApi'; // Твоя функция API
import { useAuth } from '../../../../auth/AuthContext';
import Header from "../../../landing/components/header/Header";
import {ProjectSummary} from "../../../../types/domain";

// Тип проекта — расширяем для будущих нужд


const SKELETON_COUNT = 8;

export const ProjectExplorer: React.FC = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const loaderRef = useRef<HTMLDivElement | null>(null);

    // Фильтры и поиск (заглушки)
    const [search, setSearch] = useState('');
    const [techs, setTechs] = useState<string[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [type, setType] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [total, setTotal] = useState(0);

    // Если пользователь не авторизован — заглушка
    if (!user) {
        return (
            <>
                <Header />
                <div style={{ maxWidth: 420, margin: '60px auto', textAlign: 'center', color: '#72809e' }}>
                    <h2>Просмотр проектов доступен только авторизованным пользователям</h2>
                    <p>Пожалуйста, войдите или зарегистрируйтесь</p>
                </div>
            </>
        );
    }

    const loadProjects = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetchProjects({ page, size: 10, search });

            setProjects(prev =>
                page === 0 ? res.projects : [...prev, ...res.projects]
            );

            // Есть ли ещё проекты для подгрузки
            const loadedCount = (page + 1) * res.size;
            setHasMore(loadedCount < res.total);

            setTotal(res.total);
        } catch (e) {
            console.error(e);
            setError('Ошибка загрузки проектов');
        } finally {
            setLoading(false);
        }
    }, [page, search]);


    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // Infinite scroll (каркас, пока нет API с пагинацией)
    useEffect(() => {
        if (!loaderRef.current || !hasMore || loading) return;
        const observer = new window.IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !loading && hasMore) {
                setPage((p) => p + 1);
                // TODO: load next page
            }
        });
        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore, loading]);


    const allProjects = [...projects];

    return (
        <div className={styles.root}>
            <ProjectExplorerHeader />
            <main className={styles.main}>
                <section className={styles.filtersSection}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Поиск по названию, стеку…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className={styles.filters}>
                        <span className={styles.filter}>Технологии</span>
                        <span className={styles.filter}>Роль</span>
                        <span className={styles.filter}>Тип</span>
                        <span className={styles.filter}>Статус</span>
                        <button className={styles.resetBtn} title="Сбросить фильтры" aria-label="Сбросить фильтры">
                            {/* SVG крестик — как иконка */}
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>
                </section>


                {/* Список проектов */}
                <section className={styles.cardsSection}>
                    {loading ? (
                        Array.from({length: SKELETON_COUNT}).map((_, i) =>
                            <div key={i} className={styles.cardSkeleton}/>
                        )
                    ) : error ? (
                        <div className={styles.errorBlock}>
                            <div>Ошибка: {error}</div>
                            <button onClick={loadProjects}>Повторить</button>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className={styles.emptyBlock}>
                            <div>Нет проектов по выбранным фильтрам.</div>
                            <button className={styles.createBtn}>+ Создать проект</button>
                        </div>
                    ) : (
                        <div className={styles.cardsGrid}>
                            {allProjects.map((project) =>
                                <ProjectCard key={project.id} project={project} />
                            )}
                        </div>
                    )}
                    <div ref={loaderRef} style={{ height: 1 }} />
                </section>
            </main>
        </div>
    );
};

export default ProjectExplorer;
