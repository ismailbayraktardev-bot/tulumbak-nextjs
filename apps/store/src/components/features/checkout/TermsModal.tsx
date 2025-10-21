'use client';

import React from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function TermsModal({ isOpen, onClose, title, children }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-stitch-background-light rounded-xl border border-stitch-border-color shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stitch-border-color">
          <h3 className="text-xl font-bold text-stitch-text-primary font-display">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-stitch-border-color/20 hover:bg-stitch-border-color/30 transition-colors"
          >
            <svg className="w-4 h-4 text-stitch-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none text-stitch-text-secondary">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-stitch-border-color">
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg h-10 bg-stitch-primary text-white px-6 hover:bg-stitch-primary/90 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}