import React from 'react';

interface HazardHubLogoProps {
  className?: string;
  size?: number;
}

export const HazardHubLogo: React.FC<HazardHubLogoProps> = ({ 
  className = "w-11 h-11", 
  size 
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
      >
        {/* Upper-Right Sprouting Leaf */}
        {/* Leaf blade */}
        <path
          d="M 68 28 C 70 16, 80 7, 94 5 C 96 16, 91 27, 78 32 C 74 33, 70 32, 68 28 Z"
          fill="#00875A"
        />
        {/* Leaf central vein */}
        <path
          d="M 70 27 C 77 21, 84 14, 92 7"
          stroke="#E6F8F3"
          strokeWidth="1.75"
          strokeLinecap="round"
        />

        {/* Outer Shield - Deep Emerald Outline */}
        <path
          d="M 24 23 C 38 23, 44 18, 50 15 C 56 18, 62 23, 76 23 C 76 48, 69 72, 50 85 C 31 72, 24 48, 24 23 Z"
          stroke="#007A5E"
          strokeWidth="6.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="#FFFFFF"
        />

        {/* Subtle Shield Inner Rim */}
        <path
          d="M 29 28 C 40 28, 45 23, 50 20 C 55 23, 60 28, 71 28 C 71 47, 65 67, 50 78 C 35 67, 29 47, 29 28 Z"
          fill="#E6F8F3"
          fillOpacity="0.35"
        />

        {/* Inner Leaf - Stylized environmental leaf inside the shield */}
        <path
          d="M 50 70 C 36 60, 32 45, 41 33 C 46 42, 55 45, 57 55 C 58 61, 55 66, 50 70 Z"
          fill="none"
          stroke="#007A5E"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Inner Leaf Stem & Vein */}
        <path
          d="M 41 38 C 47 46, 49 55, 50 67"
          stroke="#007A5E"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 46 47 C 49 48, 52 49, 54 51"
          stroke="#007A5E"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 48 55 C 50 56, 52 57, 54 59"
          stroke="#007A5E"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
