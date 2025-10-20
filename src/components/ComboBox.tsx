'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

interface ComboBoxProps {
  options: { id: string; name: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export default function ComboBox({
  options,
  value,
  onChange,
  placeholder = 'Select or type...',
}: ComboBoxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => 
    options.find(option => option.id === value) || null,
    [options, value]
  );

  // When the selected option changes from the outside, update the input text
  useEffect(() => {
    setQuery(selectedOption ? selectedOption.name : '');
  }, [selectedOption]);

  const filteredOptions = useMemo(() => 
    query === ''
      ? options
      : options.filter(option =>
          option.name.toLowerCase().includes(query.toLowerCase())
        ),
    [options, query]
  );

  // Handle clicks outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If the user clicks away, revert the input to the last valid selection
        setQuery(selectedOption ? selectedOption.name : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedOption]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    // If input is cleared, clear the filter in the parent
    if (newQuery === '') {
      onChange(null);
    }
  };

  const handleOptionClick = (optionId: string) => {
    onChange(optionId);
    setQuery(options.find(o => o.id === optionId)?.name || '');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-base"
      />
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {option.name}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500 dark:text-gray-400">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
}
