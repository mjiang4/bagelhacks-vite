export default function SmallBackgroundCircles() {
  return (
    <div className="absolute -z-10" style={{ top: '53%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%' }}>
      {/* Circle positioning container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Left circle - E038BC */}
        <div className="absolute w-[375px] h-[250px] rounded-full bg-[#E038BC] opacity-40 blur-2xl" style={{ left: '19%' }}></div>
        
        {/* Middle circle - 35EEDF */}
        <div className="absolute w-[375px] h-[250px] rounded-full bg-[#35EEDF] opacity-40 blur-2xl"></div>
        
        {/* Right circle - 8835EE */}
        <div className="absolute w-[375px] h-[250px] rounded-full bg-[#8835EE] opacity-40 blur-2xl" style={{ right: '19%' }}></div>
      </div>
    </div>
  );
} 