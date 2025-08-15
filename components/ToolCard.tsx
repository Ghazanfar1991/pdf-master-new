
import React from 'react';
import type { Tool } from '../types';
import Card from './Card';

interface ToolCardProps {
  tool: Tool;
  onSelect: (tool: Tool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  return (
    <Card 
      interactive 
      hover
      className="h-full flex flex-col group cursor-pointer"
      onClick={() => onSelect(tool)}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-primary shadow-md">
            {tool.icon}
          </div>
          {tool.premium && (
            <span className="badge badge-warning text-xs px-2 py-1">
              Premium
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
          {tool.title}
        </h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow">
          {tool.description}
        </p>
        
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium text-sm">
            <span>Try now</span>
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ToolCard;
