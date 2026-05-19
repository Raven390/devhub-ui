import React, { useCallback, useMemo, useState } from 'react';
import styles from './RoleSelectModal.module.css';
import { RoleDto } from '../../../types/dto';

interface RoleSelectModalProps {
    roles: RoleDto[];
    onConfirm: (roleIds: number[]) => Promise<void> | void;
    onClose: () => void;
}

type SubmitState = 'idle' | 'loading' | 'error';

export const RoleSelectModal: React.FC<RoleSelectModalProps> = ({
    roles,
    onConfirm,
    onClose,
}) => {
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [submitState, setSubmitState] = useState<SubmitState>('idle');
    const [error, setError] = useState<string | null>(null);

    const selectedIds = useMemo(() => new Set(selectedRoleIds), [selectedRoleIds]);
    const isLoading = submitState === 'loading';

    const toggleRole = useCallback((roleId: number) => {
        setSelectedRoleIds(prev => (
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        ));
    }, []);

    const handleConfirm = useCallback(async () => {
        if (selectedRoleIds.length === 0 || isLoading) return;

        setSubmitState('loading');
        setError(null);
        try {
            await onConfirm(selectedRoleIds);
            onClose();
        } catch (err) {
            setSubmitState('error');
            setError(err instanceof Error ? err.message : 'Не удалось отправить заявку');
        }
    }, [isLoading, onClose, onConfirm, selectedRoleIds]);

    return (
        <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
            <section
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="role-select-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <header className={styles.header}>
                    <div>
                        <h2 id="role-select-title" className={styles.title}>Выберите роль в проекте</h2>
                        <p className={styles.subtitle}>Можно выбрать несколько ролей, если вы готовы закрыть несколько зон ответственности.</p>
                    </div>
                    <button
                        className={styles.closeButton}
                        type="button"
                        onClick={onClose}
                        aria-label="Закрыть"
                        disabled={isLoading}
                    >
                        x
                    </button>
                </header>

                <div className={styles.body}>
                    {roles.length > 0 ? (
                        <ul className={styles.roleList}>
                            {roles.map(role => (
                                <li key={role.id}>
                                    <label className={styles.roleItem}>
                                        <input
                                            className={styles.checkbox}
                                            type="checkbox"
                                            checked={selectedIds.has(role.id)}
                                            onChange={() => toggleRole(role.id)}
                                            disabled={isLoading}
                                        />
                                        <span className={styles.roleName}>{role.name}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.empty}>В проекте пока не указаны роли для набора.</p>
                    )}

                    {submitState === 'error' && error && (
                        <div className={styles.error} role="alert">{error}</div>
                    )}
                </div>

                <footer className={styles.footer}>
                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Отмена
                    </button>
                    <button
                        className={styles.primaryButton}
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading || selectedRoleIds.length === 0}
                    >
                        {isLoading ? 'Отправляем...' : 'Вступить'}
                    </button>
                </footer>
            </section>
        </div>
    );
};
