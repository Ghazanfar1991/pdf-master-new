
import React from 'react';
import type { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onSelect: (tool: Tool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(tool)}
      className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-indigo-600"
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500 mb-4">
        {tool.icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{tool.title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tool.description}</p>
      {tool.premium && (
        <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
          Premium
        </span>
      )}
    </div>
  );
};

export default ToolCard;
