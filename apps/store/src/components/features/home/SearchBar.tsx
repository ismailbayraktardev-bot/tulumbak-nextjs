'use client';

import React, { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({ 
  placeholder = "Tatlı arayın...", 
  onSearch,
  className = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <span className="material-symbols-outlined text-stitch-text-secondary">
              search
            </span>
          </div>
          
          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full h-10 pl-12 pr-4 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-stitch-primary text-stitch-text-primary placeholder-stitch-text-secondary ${className}`}
            aria-label="Tatlı arama"
          />
        </div>
      </form>
    </div>
  );
}