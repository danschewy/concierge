'use client';

import { Check } from 'lucide-react';

interface StatusStepperProps {
  steps: string[];
  currentStep: number;
}

export default function StatusStepper({ steps, currentStep }: StatusStepperProps) {
  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={step} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono
                  ${isComplete
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-violet-500 text-white animate-pulse'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }
                `}
              >
                {isComplete ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span
                className={`text-[10px] text-center leading-tight ${
                  isComplete ? 'text-emerald-400' : isCurrent ? 'text-zinc-200' : 'text-zinc-600'
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px flex-1 mt-[-14px] ${
                  isComplete ? 'bg-emerald-500/50' : 'bg-zinc-800'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
