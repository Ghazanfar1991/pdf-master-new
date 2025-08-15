import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  className = '',
  showPercentage = false,
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-secondary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600'
  };

  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      <div className="flex items-center">
        <div className="flex-grow h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ease-out ${colorClasses[color]}`}
            style={{ width: `${clampedValue}%` }}
          ></div>
        </div>
        
        {showPercentage && (
          <span className="ml-4 text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[3rem]">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;