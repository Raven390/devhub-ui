import { Check } from 'lucide-react';
import { useState } from 'react';
import { RoleDto, TechnologyDto } from '../../types';
import { ProjectFeedStatus } from '../../hooks/useProjectFeedFilters';

interface FilterSidebarProps {
  status: ProjectFeedStatus;
  technologyIds: number[];
  roleIds: number[];
  technologies: TechnologyDto[];
  roles: RoleDto[];
  isReferenceLoading: boolean;
  referenceError: string | null;
  hasActiveFilters: boolean;
  onStatusChange: (status: ProjectFeedStatus) => void;
  onTechnologyToggle: (technologyId: number) => void;
  onRoleToggle: (roleId: number) => void;
  onReset: () => void;
}

interface StatusOption {
  value: ProjectFeedStatus;
  label: string;
}

interface CheckboxOption {
  id: number;
  name: string;
}

const VISIBLE_OPTIONS = 6;

const statusOptions: StatusOption[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'RECRUITING', label: 'Набор команды' },
  { value: 'ACTIVE', label: 'В разработке' },
  { value: 'ARCHIVED', label: 'Архив' },
];

const sectionTitleClassName =
  'mb-2 text-[10px] font-medium uppercase tracking-[0.09em] text-[var(--text-muted)]';

const skeletonRows = Array.from({ length: 4 }, (_, index) => index);

const getVisibleOptions = (options: CheckboxOption[], isExpanded: boolean): CheckboxOption[] =>
  isExpanded ? options : options.slice(0, VISIBLE_OPTIONS);

export const FilterSidebar = ({
  status,
  technologyIds,
  roleIds,
  technologies,
  roles,
  isReferenceLoading,
  referenceError,
  hasActiveFilters,
  onStatusChange,
  onTechnologyToggle,
  onRoleToggle,
  onReset,
}: FilterSidebarProps) => {
  const [isTechnologiesExpanded, setIsTechnologiesExpanded] = useState(false);
  const [isRolesExpanded, setIsRolesExpanded] = useState(false);
  const visibleTechnologies = getVisibleOptions(technologies, isTechnologiesExpanded);
  const visibleRoles = getVisibleOptions(roles, isRolesExpanded);
  const hiddenTechnologiesCount = Math.max(technologies.length - VISIBLE_OPTIONS, 0);
  const hiddenRolesCount = Math.max(roles.length - VISIBLE_OPTIONS, 0);

  const renderCheckboxGroup = (
    options: CheckboxOption[],
    selectedIds: number[],
    onToggle: (id: number) => void,
  ) => (
    <div className="space-y-1.5">
      {options.map((option) => {
        const isChecked = selectedIds.includes(option.id);

        return (
          <label
            key={option.id}
            className="group flex cursor-pointer items-center gap-2 rounded-md py-1 text-[13px] text-[var(--text-secondary)] transition duration-200 hover:text-[var(--text-primary)]"
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggle(option.id)}
              className="sr-only"
            />
            <span
              className={`inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition duration-200 ${
                isChecked
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                  : 'border-[var(--border-default)] bg-transparent text-transparent group-hover:border-[var(--border-strong)]'
              }`}
              aria-hidden="true"
            >
              <Check className="h-2.5 w-2.5" />
            </span>
            <span className={isChecked ? 'text-[var(--text-primary)]' : undefined}>
              {option.name}
            </span>
          </label>
        );
      })}
    </div>
  );

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-[60px] lg:w-[260px] lg:self-start">
      <section>
        <h2 className={sectionTitleClassName}>Статус</h2>
        <div className="space-y-1.5" role="radiogroup" aria-label="Статус проекта">
          {statusOptions.map((option) => {
            const isSelected = status === option.value;

            return (
              <label
                key={option.value}
                className="group flex cursor-pointer items-center gap-2 rounded-md py-1 text-[13px] text-[var(--text-secondary)] transition duration-200 hover:text-[var(--text-primary)]"
              >
                <input
                  type="radio"
                  name="project-status"
                  checked={isSelected}
                  onChange={() => onStatusChange(option.value)}
                  className="sr-only"
                />
                <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] transition duration-200 group-hover:border-[var(--border-strong)]">
                  {isSelected ? (
                    <span className="h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                  ) : null}
                </span>
                <span className={isSelected ? 'text-[var(--text-primary)]' : undefined}>
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <div className="my-3 h-px bg-[var(--border-dim)]" />

      <section>
        <h2 className={`${sectionTitleClassName} mt-5`}>Технологии</h2>
        {isReferenceLoading ? (
          <div className="space-y-2">
            {skeletonRows.map((row) => (
              <div key={row} className="h-4 w-32 rounded bg-white/[0.06]" />
            ))}
          </div>
        ) : (
          <>
            {renderCheckboxGroup(visibleTechnologies, technologyIds, onTechnologyToggle)}
            {hiddenTechnologiesCount > 0 ? (
              <button
                type="button"
                onClick={() => setIsTechnologiesExpanded((current) => !current)}
                className="mt-2 text-[13px] font-normal text-[var(--accent)] transition duration-200 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/25"
              >
                {isTechnologiesExpanded ? 'Скрыть' : `Показать ещё ${hiddenTechnologiesCount}`}
              </button>
            ) : null}
          </>
        )}
      </section>

      <div className="my-3 h-px bg-[var(--border-dim)]" />

      <section>
        <h2 className={`${sectionTitleClassName} mt-5`}>Роли</h2>
        {isReferenceLoading ? (
          <div className="space-y-2">
            {skeletonRows.slice(0, 3).map((row) => (
              <div key={row} className="h-4 w-28 rounded bg-white/[0.06]" />
            ))}
          </div>
        ) : (
          <>
            {renderCheckboxGroup(visibleRoles, roleIds, onRoleToggle)}
            {hiddenRolesCount > 0 ? (
              <button
                type="button"
                onClick={() => setIsRolesExpanded((current) => !current)}
                className="mt-2 text-[13px] font-normal text-[var(--accent)] transition duration-200 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/25"
              >
                {isRolesExpanded ? 'Скрыть' : `Показать ещё ${hiddenRolesCount}`}
              </button>
            ) : null}
          </>
        )}
      </section>

      {referenceError ? (
        <p className="mt-4 text-[12px] leading-5 text-[var(--danger)]">{referenceError}</p>
      ) : null}

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-5 text-[12px] font-normal text-[var(--accent)] transition duration-200 hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/25"
        >
          Сбросить фильтры
        </button>
      ) : null}
    </aside>
  );
};
