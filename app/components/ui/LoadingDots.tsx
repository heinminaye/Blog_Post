"use client";

import React from "react";

interface LoadingDotsProps {
  dotCount?: number;
  className?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ dotCount = 4, className = "" }) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {Array.from({ length: dotCount }).map((_, i) => (
        <div key={i} className="relative">
          {/* Dot */}
          <div
            className="w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full transform-gpu z-10"
            style={{
              animation: `smoothBounce 1.6s ease-in-out infinite ${i * -0.2}s`,
            }}
          />

          {/* Shadow */}
          <div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-purple-900/70 blur-[3px] rounded-full"
            style={{
              animation: `shadowExpand 1.6s ease-in-out infinite ${i * -0.2}s`,
            }}
          />
        </div>
      ))}

      <style jsx>{`
        @keyframes smoothBounce {
          0%, 100% {
            transform: translateY(0px);
            filter: drop-shadow(0 2px 4px rgba(168, 85, 247, 0.4));
          }
          50% {
            transform: translateY(-14px);
            filter: drop-shadow(0 6px 16px rgba(168, 85, 247, 0.6));
          }
        }

        @keyframes shadowExpand {
          0%, 100% {
            transform: translateX(-50%) scaleX(1.4);
            opacity: 0.7;
          }
          50% {
            transform: translateX(-50%) scaleX(0.6);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingDots;