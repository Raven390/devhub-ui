import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {Technology, Role, ProjectType, Project} from "../../types/domain";
import { ProjectDetailView } from "./ProjectDetailView";
import { SkeletonField } from "../../components/ui/SkeletonField";
import { fetchProjectById } from "../../api/ProjectsApi";
import { fetchTechnologies, fetchRoles, fetchProjectTypes } from "../../api/ReferenceApi"
import ProjectExplorerHeader from "../../components/ProjectExplorerHeader/ProjectExplorerHeader";

// Типы для справочников
interface RefItem {
    id: number | string;
    name: string;
}

export const ProjectDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user, loading: authLoading } = useAuth();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [technologiesList, setTechnologiesList] = useState<Technology[]>([]);
    const [rolesList, setRolesList] = useState<Role[]>([]);
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);

    // Получаем проект и справочники
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        Promise.all([
            fetchProjectById(id!),
            fetchTechnologies(),
            fetchRoles(),
            fetchProjectTypes()
        ])
            .then(([proj, techs, roles, types]) => {
                if (!mounted) return;
                setProject(proj);
                console.log(project);
                setTechnologiesList(techs);
                setRolesList(roles);
                setProjectTypes(types);
            })
            .catch(e => {
                if (!mounted) return;
                setError(e?.message || "Ошибка загрузки данных проекта");
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [id]);

    if (authLoading || loading) {
        return <ProjectDetailSkeleton />;
    }
    if (error || !project) {
        return (
            <div className="error" style={{ maxWidth: 540, margin: "48px auto", fontSize: 18 }}>
                {error || "Проект не найден"}
            </div>
        );
    }

    // Определяем права
    const isOwner = user?.businessId === project.owner.id;
    // TODO: добавить isAdmin/isMember если потребуется

    return (
        <>
            <ProjectExplorerHeader />
            <main style={{ paddingTop: "72px" }}>
                <ProjectDetailView
                    project={project}
                    technologiesList={technologiesList}
                    rolesList={rolesList}
                    projectTypes={projectTypes}
                    canEdit={isOwner}
                />
            </main>
        </>
    );
};

const ProjectDetailSkeleton: React.FC = () => (
    <div style={{ maxWidth: 900, margin: "48px auto" }}>
        <SkeletonField width={340} height={40} style={{ marginBottom: 28 }} />
        <SkeletonField width={520} height={32} style={{ marginBottom: 12 }} />
        <SkeletonField width="100%" height={64} style={{ marginBottom: 20 }} />
        <SkeletonField width={120} height={32} style={{ marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 12 }}>
            <SkeletonField width={80} height={28} />
            <SkeletonField width={80} height={28} />
            <SkeletonField width={80} height={28} />
        </div>
        <div style={{ height: 34 }} />
        <SkeletonField width="70%" height={28} style={{ marginBottom: 12 }} />
    </div>
);
