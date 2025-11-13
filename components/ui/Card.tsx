
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800/70 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};
