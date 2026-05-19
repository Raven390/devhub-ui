import React, { useCallback, useMemo, useState } from 'react';
import styles from './ProjectMembersBlock.module.css';
import { Member, Role, User } from '../../types/domain';
import { EditableMultiSelect } from './EditableMultiSelect';
import { FieldEditIcon } from './FieldEditIcon';
import { Spinner } from './Spinner';
import AsyncUserSelect from './AsyncUserSelect';

/**
 * Блок участников проекта.
 *
 * - Рендерит список участников с их ролями и статусами.
 * - Редактирование ролей участника.
 * - Удаление участника (с защитой от удаления владельца).
 * - Добавление нового участника по выбору из автокомплита + роли.
 *
 * Истина хранится снаружи: onMembersChange получает полный массив.
 */
export interface ProjectMembersBlockProps {
    members: Member[];
    rolesCatalog: Role[];
    canEdit: boolean;
    onMembersChange: (newMembers: Member[]) => Promise<void>;
    protectOwnerRemoval?: boolean;
}

const uuidLike = (v: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

const dedupeById = <T extends { id: any }>(arr: T[] | undefined): T[] =>
    Array.from(new Map((arr ?? []).filter(Boolean).map(x => [x.id, x])).values());

const ProjectMembersBlockComponent: React.FC<ProjectMembersBlockProps> = ({
                                                                              members,
                                                                              rolesCatalog,
                                                                              canEdit,
                                                                              onMembersChange,
                                                                              protectOwnerRemoval = true,
                                                                          }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [globalBusy, setGlobalBusy] = useState(false);

    // Локальное состояние формы добавления
    const [selectedUser, setSelectedUser] = useState<User | null>(null); // <-- показываем в UI чип
    const [newUserId, setNewUserId] = useState('');
    const [newRoleIds, setNewRoleIds] = useState<number[]>([]);
    const [addError, setAddError] = useState<string | null>(null);

    const safeMembers = useMemo<Member[]>(() => {
        return (members ?? []).map(m => ({
            ...m,
            user: m.user ?? { id: '' },
            roles: dedupeById(m.roles),
        }));
    }, [members]);

    const startEdit = useCallback((memberId: string) => {
        if (!canEdit) return;
        setEditingId(memberId);
    }, [canEdit]);

    const cancelEdit = useCallback(() => setEditingId(null), []);

    const handleAdd = useCallback(async () => {
        setAddError(null);

        const userId = (selectedUser?.id || newUserId).trim();

        if (!userId) {
            setAddError('Выберите пользователя');
            return;
        }
        if (!uuidLike(userId)) {
            setAddError('Неверный формат UUID');
            return;
        }
        if (newRoleIds.length === 0) {
            setAddError('Выберите хотя бы одну роль');
            return;
        }
        if (safeMembers.some(m => m.user?.id === userId)) {
            setAddError('Пользователь уже в проекте');
            return;
        }

        const roles = dedupeById(rolesCatalog.filter(r => newRoleIds.includes(r.id)));

        const newMember: Member = {
            user: selectedUser ?? { id: userId, name: '—' },
            roles,
            status: 'INVITED',
        };

        setGlobalBusy(true);
        try {
            await onMembersChange([...safeMembers, newMember]);
            // Сброс формы после успешного добавления
            setSelectedUser(null);
            setNewUserId('');
            setNewRoleIds([]);
        } catch (e: any) {
            setAddError(e?.message || 'Не удалось добавить участника');
        } finally {
            setGlobalBusy(false);
        }
    }, [selectedUser, newUserId, newRoleIds, rolesCatalog, safeMembers, onMembersChange]);

    const saveRoles = useCallback(async (memberId: string, roleNames: string[]) => {
        const nextRoles = dedupeById(rolesCatalog.filter(r => roleNames.includes(r.name)));
        const next = safeMembers.map(m => m.id === memberId ? { ...m, roles: nextRoles } : m);

        const prev = safeMembers.find(m => m.id === memberId)?.roles ?? [];
        const same = prev.length === nextRoles.length && prev.every(pr => nextRoles.some(nr => nr.id === pr.id));
        if (same) {
            setEditingId(null);
            return;
        }

        setBusyId(memberId);
        try {
            await onMembersChange(next);
            setEditingId(null);
        } finally {
            setBusyId(null);
        }
    }, [rolesCatalog, safeMembers, onMembersChange]);

    const remove = useCallback(async (memberId: string) => {
        const member = safeMembers.find(m => m.id === memberId);
        if (!member) return;

        if (protectOwnerRemoval && member.status === 'OWNER') {
            alert('Нельзя удалить владельца проекта');
            return;
        }
        if (!confirm('Удалить участника из проекта?')) return;

        const next = safeMembers.filter(m => m.id !== memberId);
        setBusyId(memberId);
        try {
            await onMembersChange(next);
        } finally {
            setBusyId(null);
        }
    }, [safeMembers, onMembersChange, protectOwnerRemoval]);

    // --- UI ---
    return (
        <section className={styles.block} aria-label="Секция участников проекта">
            <div className={styles.header}>
                <h3 className={styles.title}>Участники</h3>
                {globalBusy && <Spinner className={styles.globalSpinner} />}
            </div>

            {/* Список участников */}
            <ul className={styles.list} role="list">
                {safeMembers.map(member => {
                    const isEditing = editingId === member.id;
                    const roles = dedupeById(member.roles);
                    const roleNames = roles.map(r => r.name);
                    const initialsSource = member.user?.name || member.user?.email || member.user?.id || 'U';
                    const initials = (initialsSource.slice(0, 2)).toUpperCase();

                    return (
                        <li key={member.id} className={styles.item}>
                            <div className={styles.user}>
                                {member.user?.avatarUrl ? (
                                    <img
                                        className={styles.avatar}
                                        src={member.user.avatarUrl}
                                        alt={member.user?.name || 'user'}
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className={styles.avatarFallback} aria-hidden="true">
                                        {initials}
                                    </div>
                                )}

                                <div className={styles.meta}>
                                    <div className={styles.nameRow}>
                    <span className={styles.name}>
                      {member.user?.name || member.user?.email || '—'}
                    </span>

                                        {member.status && (
                                            <span
                                                className={`${styles.badge} ${styles[member.status.toLowerCase()] || ''}`}
                                                title={member.status}
                                            >
                        {member.status === 'OWNER' ? 'Владелец'
                            : member.status === 'INVITED' ? 'Приглашён'
                                : member.status === 'ACTIVE' ? 'Участник'
                                    : member.status}
                      </span>
                                        )}
                                    </div>

                                    {member.user?.email && (
                                        <span className={styles.email}>{member.user.email}</span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.rolesCell}>
                                {!isEditing && (
                                    <div
                                        className={`${styles.rolesInline} ${canEdit ? styles.editable : ''}`}
                                        onClick={() => startEdit(member.id!)}
                                        role={canEdit ? 'button' : undefined}
                                        tabIndex={canEdit ? 0 : -1}
                                        aria-label={canEdit ? 'Редактировать роли участника' : undefined}
                                    >
                                        {roleNames.length > 0 ? (
                                            roleNames.map(r => <span key={r} className={styles.chip}>{r}</span>)
                                        ) : (
                                            <span className={styles.empty}>Роли не назначены</span>
                                        )}
                                        {canEdit && <FieldEditIcon className={styles.editIcon} />}
                                    </div>
                                )}

                                {isEditing && (
                                    <div className={styles.editWrap}>
                                        <EditableMultiSelect
                                            label=""
                                            values={roleNames}
                                            options={rolesCatalog}
                                            canEdit
                                            onSave={(names) => saveRoles(member.id!, names)}
                                            loading={busyId === member.id}
                                            placeholder="Выберите роли"
                                        />

                                        <div className={styles.rowActions}>
                                            <button
                                                className={styles.btnSecondary}
                                                onClick={cancelEdit}
                                                type="button"
                                            >
                                                Отмена
                                            </button>
                                            <button
                                                className={styles.btnDanger}
                                                onClick={() => remove(member.id!)}
                                                type="button"
                                                disabled={busyId === member.id}
                                                title="Удалить участника"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {busyId === member.id && <Spinner className={styles.rowSpinner} />}
                        </li>
                    );
                })}
            </ul>

            {/* Форма добавления участника */}
            {canEdit && (
                <div className={styles.addBlock}>
                    <h4 className={styles.subTitle}>Добавить участника</h4>

                    <div className={styles.addForm}>
                        {/* Выбор пользователя */}
                        <div className={styles.userSelect}>
                            {selectedUser ? (
                                <div className={styles.selectedUserChip}>
                                    {selectedUser.avatarUrl ? (
                                        <img className={styles.avatarSm} src={selectedUser.avatarUrl} alt="" />
                                    ) : (
                                        <div className={styles.avatarFallbackSm}>
                                            {(selectedUser.name || selectedUser.email || 'U').slice(0,2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className={styles.selectedUserMeta}>
                                        <div className={styles.selectedUserName}>
                                            {selectedUser.name || '—'}
                                        </div>
                                        {selectedUser.email && (
                                            <div className={styles.selectedUserEmail}>{selectedUser.email}</div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.clearBtn}
                                        onClick={() => { setSelectedUser(null); setNewUserId(''); }}
                                        title="Сбросить выбор пользователя"
                                        disabled={globalBusy}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <AsyncUserSelect
                                    value={newUserId /* не обязателен, но оставим для совместимости */}
                                    onSelect={(u) => { setSelectedUser(u); setNewUserId(u.id); }}
                                    placeholder="Имя или email пользователя"
                                    disabled={globalBusy}
                                />
                            )}
                        </div>

                        {/* Роли нового участника */}
                        <div className={styles.inlineSelect}>
                            <EditableMultiSelect
                                label=""
                                values={rolesCatalog.filter(r => newRoleIds.includes(r.id)).map(r => r.name)}
                                options={rolesCatalog}
                                canEdit
                                onSave={async (names) => {
                                    const ids = rolesCatalog.filter(r => names.includes(r.name)).map(r => r.id);
                                    setNewRoleIds(Array.from(new Set(ids)));
                                }}
                                loading={false}
                                placeholder="Роли участника"
                            />
                        </div>

                        {/* Кнопка добавления */}
                        <button
                            className={styles.btnPrimary}
                            onClick={handleAdd}
                            type="button"
                            disabled={
                                globalBusy ||
                                !(selectedUser?.id || newUserId) ||
                                newRoleIds.length === 0
                            }
                            title={
                                !(selectedUser?.id || newUserId) ? 'Выберите пользователя'
                                    : newRoleIds.length === 0 ? 'Выберите роль'
                                        : 'Добавить участника'
                            }
                        >
                            {globalBusy ? 'Сохраняем…' : 'Добавить'}
                        </button>
                    </div>

                    {addError && <div className={styles.error}>{addError}</div>}
                </div>
            )}
        </section>
    );
};

export const ProjectMembersBlock = React.memo(ProjectMembersBlockComponent);
export default ProjectMembersBlock;
