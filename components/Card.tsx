import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  className = '', 
  children, 
  hover = false,
  interactive = false,
  ...props 
}) => {
  const baseClasses = 'card overflow-hidden transition-all duration-300';
  
  const hoverClass = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  const interactiveClass = interactive ? 'cursor-pointer' : '';
  
  const classes = `${baseClasses} ${hoverClass} ${interactiveClass} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;