import React from 'react';

export default function SmallBackgroundCircles() {
  return (
    <div className="absolute -z-10 inset-0 w-full">
      {/* Circle positioning container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Left circle - E038BC */}
        <div className="absolute w-[375px] h-[250px] rounded-full bg-[#E038BC] opacity-40 blur-2xl" style={{ left: 'calc(50% - 375px)', transform: 'translateX(-50%)' }}></div>
        
        {/* Middle circle - 35EEDF */}
        <div className="absolute w-[375px] h-[250px] rounded-full bg-[#35EEDF] opacity-40 blur-2xl" style={{ left: '50%', transform: 'translateX(-50%)' }}></div>
        
        {/* Right circle - 8835EE */}
        <div className="absolute w-[375px] h-[250px] rounded-full bg-[#8835EE] opacity-40 blur-2xl" style={{ left: 'calc(50% + 375px)', transform: 'translateX(-50%)' }}></div>
      </div>
    </div>
  );
} 