import React, { useState, useRef, useEffect } from "react";
import styles from "./EditableDropdown.module.css";
import { FieldEditIcon } from "./FieldEditIcon";

interface Option {
    value: string | number;
    label: string;
    colorClass?: string; // опционально для кастомных цветов
}

interface EditableDropdownProps {
    label?: string;
    value: string | number;
    options: Option[];
    canEdit?: boolean;
    onSave: (newValue: string) => Promise<void>;
    loading?: boolean;
    className?: string;
}

export const EditableDropdown: React.FC<EditableDropdownProps> = ({
                                                                      label,
                                                                      value,
                                                                      options,
                                                                      canEdit = false,
                                                                      onSave,
                                                                      loading = false,
                                                                      className = "",
                                                                  }) => {
    const [editing, setEditing] = useState(false);
    const [selected, setSelected] = useState(value);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editing) {
            setSelected(value);
        }
    }, [editing, value]);

    // Клик вне dropdown — выйти из edit-режима
    useEffect(() => {
        if (!editing) return;
        function onClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setEditing(false);
            }
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [editing]);

    // Обработка выбора
    const handleSelect = async (v: string | number) => {
        if (v === value) {
            setEditing(false);
            return;
        }
        setSaving(true);
        try {
            await onSave(String(v));
            setSaved(true);
            setTimeout(() => setSaved(false), 1200);
        } finally {
            setSaving(false);
            setEditing(false);
        }
    };

    return (
        <div className={`${styles.wrapper} ${className}`}>
            {label && <div className={styles.label}>{label}</div>}

            {!editing ? (
                <div
                    className={`${styles.displayField} ${canEdit ? styles.editable : ""}`}
                    tabIndex={canEdit ? 0 : -1}
                    role={canEdit ? "button" : undefined}
                    aria-label={label}
                    onClick={() => canEdit && setEditing(true)}
                    onKeyDown={e => {
                        if (canEdit && (e.key === "Enter" || e.key === " ")) setEditing(true);
                    }}
                >
                    <span className={`${styles.badge} ${styles[String(value).toLowerCase()]}`}>
                        {options.find(opt => opt.value === value)?.label || value}
                    </span>
                    {canEdit && <FieldEditIcon className={styles.editIcon} />}
                    {saved && (
                        <span className={styles.saved} title="Сохранено!">✔</span>
                    )}
                </div>
            ) : (
                <div className={styles.dropdownWrap} ref={ref}>
                    <div className={styles.dropdown}>
                        {options.map(opt => (
                            <div
                                key={opt.value}
                                className={`${styles.option} ${opt.value === value ? styles.selected : ""} ${opt.colorClass || ""}`}
                                tabIndex={0}
                                onClick={() => handleSelect(opt.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter" || e.key === " ") handleSelect(opt.value);
                                    if (e.key === "Escape") setEditing(false);
                                }}
                            >
                                <span className={`${styles.badge} ${styles[String(opt.value).toLowerCase()]}`}>
                                    {opt.label}
                                </span>
                                {opt.value === value && <span className={styles.tick}>✔</span>}
                            </div>
                        ))}
                        {saving && <div className={styles.spinner} />}
                    </div>
                </div>
            )}
        </div>
    );
};
