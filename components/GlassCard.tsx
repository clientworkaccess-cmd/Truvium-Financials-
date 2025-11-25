import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "", 
  padding = "p-6" 
}) => {
  return (
    <div className={`glass-panel rounded-2xl shadow-lg border border-white/10 ${padding} ${className}`}>
      {children}
    </div>
  );
};
