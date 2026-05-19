import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { searchUsers } from '../api/UserApi';
import styles from './AsyncUserSelect.module.css';
import { User } from '../../../types/domain';

interface AsyncUserSelectProps {
    /** выбранный userId (контролируемое состояние внешней формой) */
    value?: string;
    /** колбэк при выборе юзера */
    onSelect: (user: User) => void;
    placeholder?: string;
    disabled?: boolean;
    /** минимальная длина запроса */
    minQueryLength?: number; // по умолчанию 2
}

/**
 * Асинхронный селект пользователя по имени/email с клавиатурной навигацией.
 * UX-паттерн: выбор по onClick; предотвращаем blur инпута через onMouseDown на UL.
 */
export const AsyncUserSelect: React.FC<AsyncUserSelectProps> = ({
                                                                    value,
                                                                    onSelect,
                                                                    placeholder = 'Имя или email',
                                                                    disabled,
                                                                    minQueryLength = 2,
                                                                }) => {
    const [query, setQuery] = useState<string>('');
    const debounced = useDebouncedValue(query, 300);

    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [items, setItems] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const abortRef = useRef<AbortController | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const listboxId = 'user-ac-list';

    // закрытие по клику вне
    useEffect(() => {
        const onDocMouseDown = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDocMouseDown);
        return () => document.removeEventListener('mousedown', onDocMouseDown);
    }, []);

    // поиск
    useEffect(() => {
        setError(null);

        const q = debounced.trim();
        if (q.length < minQueryLength || disabled) {
            // сбрасываем состояние
            abortRef.current?.abort();
            abortRef.current = null;
            setItems([]);
            setLoading(false);
            setOpen(false);
            return;
        }

        // отменяем предыдущий запрос
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);

        searchUsers({ query: q, limit: 10 })
            .then((list) => {
                if (controller.signal.aborted) return;
                setItems(list);
                setActiveIndex(0);
                setOpen(list.length > 0);
                setLoading(false);
                abortRef.current = null;
            })
            .catch((err: unknown) => {
                if (controller.signal.aborted) return;
                // нормализуем ошибку
                const isAbortError =
                    (err as any)?.name === 'AbortError' ||
                    (err as any)?.code === 20 ||
                    (err as any)?.message?.includes?.('aborted');
                if (isAbortError) return;

                setError((err as Error)?.message || 'Ошибка поиска');
                setLoading(false);
                abortRef.current = null;
            });

        return () => controller.abort();
    }, [debounced, minQueryLength, disabled]);

    const handleSelect = (u: User) => {
        onSelect(u);
        // Очищаем и закрываем. Если хочешь оставлять выбранного в инпуте — закомментируй setQuery('')
        setQuery('');
        setOpen(false);
    };

    const renderLabel = (u: User): string => u.name || u.email || u.id;

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (!open || items.length === 0) {
            if (e.key === 'ArrowDown' && items.length > 0) setOpen(true);
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Home') {
            e.preventDefault();
            setActiveIndex(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            setActiveIndex(items.length - 1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const item = items[activeIndex];
            if (item) handleSelect(item);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
        } else if (e.key === 'Tab') {
            // естественный уход по табу — закрываем дропдаун
            setOpen(false);
        }
    };

    const helper = useMemo(() => {
        if (disabled) return '';
        if (loading) return 'Ищем…';
        if (error) return error;
        if (open && !loading && debounced.trim().length >= minQueryLength && items.length === 0) {
            return 'Ничего не найдено';
        }
        return '';
    }, [disabled, loading, error, open, items.length, debounced, minQueryLength]);

    const activeOptionId =
        open && items.length > 0 ? `user-ac-option-${items[activeIndex]?.id}` : undefined;

    return (
        <div className={styles.container} ref={containerRef}>
            <input
                className={styles.input}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                onFocus={() => setOpen(items.length > 0)}
                onKeyDown={onKeyDown}
                // A11y
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-activedescendant={activeOptionId}
                aria-invalid={!!error}
                autoComplete="off"
            />

            {helper && <div className={styles.helper}>{helper}</div>}

            {open && items.length > 0 && (
                <ul
                    id={listboxId}
                    role="listbox"
                    className={styles.dropdown}
                    // Важно: предотвращаем blur инпута, но не ломаем onClick на потомках
                    onMouseDown={(e) => e.preventDefault()}
                >
                    {items.map((u, idx) => {
                        const label = renderLabel(u);
                        const isActive = idx === activeIndex;
                        const optionId = `user-ac-option-${u.id}`;
                        return (
                            <li
                                id={optionId}
                                key={u.id}
                                role="option"
                                aria-selected={isActive}
                                className={`${styles.item} ${isActive ? styles.active : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(u);
                                }}
                                onMouseEnter={() => setActiveIndex(idx)}
                                title={label}
                            >
                                {u.avatarUrl ? (
                                    <img className={styles.avatar} src={u.avatarUrl} alt="" />
                                ) : (
                                    <div className={styles.avatarFallback}>
                                        {(label ?? 'U').slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className={styles.meta}>
                                    <div className={styles.name}>{u.name || '—'}</div>
                                    <div className={styles.email}>{u.email}</div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default AsyncUserSelect;
