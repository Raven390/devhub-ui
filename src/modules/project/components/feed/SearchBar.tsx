import { Search, X } from 'lucide-react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(value);
  const isSyncingExternalValueRef = useRef(false);
  const debouncedValue = useDebouncedValue(inputValue, 300);

  useEffect(() => {
    isSyncingExternalValueRef.current = true;
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isSyncingExternalValueRef.current) {
      isSyncingExternalValueRef.current = false;
      return;
    }

    if (debouncedValue === inputValue && debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, inputValue, onChange, value]);

  const clearSearch = () => {
    setInputValue('');
    if (value) {
      onChange('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      clearSearch();
      event.currentTarget.blur();
    }
  };

  return (
    <div className="relative h-8 w-full max-w-[280px]">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
        aria-hidden="true"
      />
      <input
        type="search"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Поиск проектов..."
        className="h-8 w-full rounded-md border border-[var(--border-dim)] bg-[var(--bg-elevated)] py-0 pl-8 pr-8 text-[13px] font-normal text-[var(--text-primary)] outline-none transition duration-200 placeholder:text-white/30 hover:border-[var(--border-default)] focus:border-[var(--border-strong)] focus:ring-2 focus:ring-blue-500/10"
        aria-label="Поиск проектов"
      />
      {inputValue ? (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-[var(--text-muted)] transition duration-200 hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/25"
          aria-label="Очистить поиск"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
};
