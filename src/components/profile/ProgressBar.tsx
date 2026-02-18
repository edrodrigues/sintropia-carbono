"use client";

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ current, max, label, showPercentage = true }: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-white/90 dark:text-white/80">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-white/70">
        <span>{current} pts</span>
        <span>{max} pts</span>
      </div>
    </div>
  );
}
