
import React from 'react';

export const Logo: React.FC<{ className?: string; color?: string }> = ({ className = "w-12 h-12", color = "#4A5D4E" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <span className="font-serif font-black text-4xl" style={{ color: color }}>A</span>
      <svg 
        className="absolute w-full h-full pointer-events-none" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M10 60C30 45 70 75 90 60C85 75 40 85 10 60Z" 
          fill="#C5A059" 
          fillOpacity="0.8"
        />
        <path 
          d="M15 75C40 65 60 85 85 70C75 80 45 90 15 75Z" 
          fill="#C5A059" 
          fillOpacity="0.6"
        />
      </svg>
    </div>
  );
};

export default Logo;
