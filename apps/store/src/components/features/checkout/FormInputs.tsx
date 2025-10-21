'use client';

import React from 'react';

interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'select';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

export function Input({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  options,
  className = '',
}: InputProps) {
  const baseInputClasses = `
    flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg
    text-stitch-text-primary focus:outline-none focus:ring-2 focus:ring-stitch-primary/50
    border border-stitch-border-color bg-stitch-background-light
    focus:border-stitch-primary h-14 placeholder:text-stitch-text-secondary
    p-[15px] text-base font-normal leading-normal transition-colors
  `;

  return (
    <label className="flex flex-col w-full">
      <p className="text-stitch-text-primary text-base font-medium leading-normal pb-2">
        {label}
        {required && <span className="text-stitch-primary ml-1">*</span>}
      </p>
      
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`${baseInputClasses} form-select ${className}`}
        >
          <option value="">Seçiniz</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`${baseInputClasses} form-input ${className}`}
        />
      )}
    </label>
  );
}

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FormRow({ children, className = '' }: FormRowProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {children}
    </div>
  );
}

interface FormFullRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FormFullRow({ children, className = '' }: FormFullRowProps) {
  return (
    <div className={`md:col-span-2 ${className}`}>
      {children}
    </div>
  );
}