'use client';

import React from 'react';

interface StitchProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

export function StitchProgressBar({ currentStep, totalSteps, steps }: StitchProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="flex flex-col gap-3 px-4">
      {/* Step Labels */}
      <div className="flex gap-6 justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div key={step.id} className="flex items-center gap-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  isCompleted 
                    ? 'bg-stitch-primary' 
                    : isActive 
                    ? 'bg-stitch-primary' 
                    : 'bg-stitch-border-color'
                }`}
              />
              <p 
                className={`text-sm font-medium leading-normal ${
                  isActive 
                    ? 'text-stitch-text-primary' 
                    : 'text-stitch-text-secondary'
                }`}
              >
                {step.title}
              </p>
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <div className="rounded-full bg-stitch-border-color">
        <div 
          className="h-2 rounded-full bg-stitch-primary transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}