import React, { useState, useEffect, useRef } from 'react';
import styles from './ProjectForm.module.css';
import MultiSelect from '../../../../components/ui/MultiSelect';
import TextField from '../../../../components/ui/TextField';
import TextareaField from '../../../../components/ui/TextareaField';
import PrimaryButton from '../../../../components/ui/PrimaryButton';
import SecondaryButton from '../../../../components/ui/SecondaryButton';
import {useNavigate} from "react-router-dom";
import {createProject} from "../../api/ProjectsApi";
import {fetchProjectTypes, fetchRoles, fetchTechnologies} from "../../api/ReferenceApi";
import {useAuth} from "../../../../auth/AuthContext";

const NAME_MAX = 128;
const DESC_MAX = 3000;
const SHORT_DESCRIPTION_MAX = 300;

const ProjectForm: React.FC = () => {
    const { user } = useAuth();
    // Состояния полей
    const [name, setName] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [description, setDescription] = useState('');
    const [technologies, setTechnologies] = useState<string[]>([]);
    const [roles, setRoles] = useState<string[]>([]);

    // Ошибки валидации
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const nameInputRef = useRef<HTMLInputElement>(null);

    const [technologiesList, setTechnologiesList] = useState<{ id: number, name: string }[]>([]);
    const [rolesList, setRolesList] = useState<{ id: number, name: string }[]>([]);
    const [projectTypes, setProjectTypes] = useState<{ id: string, name: string }[]>([]);
    const [myRoleIds, setMyRoleIds] = useState<number[]>([]);       // роли текущего юзера (обязательны)


    useEffect(() => {
        fetchTechnologies().then(setTechnologiesList);
        fetchRoles().then(setRolesList);
        fetchProjectTypes().then(setProjectTypes);
    }, []);

    const [technologyIds, setTechnologyIds] = useState<number[]>([]);
    const [roleIds, setRoleIds] = useState<number[]>([]);
    const [typeId, setTypeId] = useState<string>("");

    useEffect(() => {
        nameInputRef.current?.focus();
    }, []);

    useEffect(() => {
        setErrors({});
        setSubmitError(null);
    }, [name, shortDescription, description, technologies, roles]);


    // Валидация
    function validate() {
        const errs: { [key: string]: string } = {};
        if (!name.trim()) errs.name = 'Название обязательно';
        if (name.length > NAME_MAX) errs.name = 'Слишком длинное название';
        if (!shortDescription.trim()) errs.shortDescription = 'Краткое описание обязательно';
        if (shortDescription.length > SHORT_DESCRIPTION_MAX) errs.shortDescription = 'Слишком длинное описание';
        if (!description.trim()) errs.description = 'Описание обязательно';
        if (description.length > DESC_MAX) errs.description = 'Слишком длинное описание';
        if (technologyIds.length === 0) errs.technologies = 'Выберите хотя бы одну технологию';
        if (roleIds.length === 0) errs.roles = 'Выберите хотя бы одну роль';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    // Подсказка: держим myRoleIds в пределах выбранных project roleIds (опционально)
    useEffect(() => {
        // если убрали роль из общего списка — убираем её и из моих ролей
        const filtered = myRoleIds.filter(rid => roleIds.includes(rid));
        if (filtered.length !== myRoleIds.length) setMyRoleIds(filtered);
    }, [roleIds]); // eslint-disable-line react-hooks/exhaustive-deps

    // Сабмит с интеграцией с API
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setSubmitError(null);
        setLoading(true);
        try {
            const userId = user?.businessId || user?.username;
            if (!userId) throw new Error('Не удалось определить userId для участника');

            await createProject({
                name,
                shortDescription,
                description,
                typeId,
                status: "RECRUITING",
                technologyIds,
                roleIds,
                members: [
                    {
                        user: { id: userId },
                        roles: myRoleIds.map(id => {
                            const role = rolesList.find(r => r.id === id);
                            return role ? { id: role.id, name: role.name } : { id, name: '' };
                        }),
                        status: "OWNER"
                    },
                ],
            });

            // После успеха редирект на список проектов
            navigate('/projects', { state: { created: true } });
        } catch (err: any) {
            setSubmitError(
                err?.message || (typeof err === 'string' ? err : 'Ошибка при создании проекта')
            );
        } finally {
            setLoading(false);
        }
    }

    // Отмена (назад)
    function handleCancel() {
        window.history.back();
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
            <TextField
                ref={nameInputRef}
                label="Название проекта"
                value={name}
                onChange={setName}
                placeholder="Новый проект"
                maxLength={NAME_MAX}
                error={errors.name}
                autoFocus
            />
            <div className={styles.field}>
                <label className={styles.label} htmlFor="projectTypeSelect">
                    Тип проекта
                </label>
                <select
                    id="projectTypeSelect"
                    value={typeId}
                    onChange={e => setTypeId(e.target.value)}
                    className={styles.select}
                    required
                >
                    <option value="" disabled hidden>
                        Выберите тип проекта
                    </option>
                    {projectTypes.map(pt =>
                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                    )}
                </select>
                {/* error && <div className={styles.error}>{error}</div> */}
            </div>
            <TextareaField
                label="Краткое описание"
                value={shortDescription}
                onChange={setShortDescription}
                placeholder="Краткое описание проекта"
                maxLength={SHORT_DESCRIPTION_MAX}
                rows={2}
            />

            <TextareaField
                label="Описание"
                value={description}
                onChange={setDescription}
                placeholder="Подробно опишите идею, цели, задачи…"
                maxLength={DESC_MAX}
                error={errors.description}
                rows={4}
            />

            <MultiSelect
                label="Технологии"
                options={technologiesList.map(t => ({value: t.id, label: t.name}))}
                selected={technologyIds}
                onChange={ids => setTechnologyIds(ids as number[])}
                placeholder="Выберите технологии"
                error={errors.technologies}
            />

            <MultiSelect
                label="Роли"
                options={rolesList.map(r => ({value: r.id, label: r.name}))}
                selected={roleIds}
                onChange={ids => setRoleIds(ids as number[])}
                placeholder="Выберите роли"
                error={errors.roles}
            />

            {/* 🧑 Мои роли как участника (обязательно) */}
            <MultiSelect
                label="Мои роли в проекте"
                options={rolesList
                    .filter(r => roleIds.includes(r.id)) // можно ограничить только выбранными в проекте
                    .map(r => ({ value: r.id, label: r.name }))}
                selected={myRoleIds}
                onChange={ids => setMyRoleIds(ids as number[])}
                placeholder="Выберите вашу роль"
                error={errors.myRoles || errors.members}
            />

            {(submitError) && <div className={styles.submitError}>{submitError}</div>}

            <div className={styles.actions}>
                <PrimaryButton
                    type="submit"
                    disabled={
                        loading ||
                        !name.trim() ||
                        !shortDescription.trim() ||
                        !description.trim() ||
                        !(technologies.length < 1) ||
                        !(roles.length < 1)
                    }
                    loading={loading}
                >
                    Создать проект
                </PrimaryButton>
                <SecondaryButton type="button" onClick={handleCancel} disabled={loading}>
                    Отмена
                </SecondaryButton>
            </div>
        </form>
    );
};

export default ProjectForm;
