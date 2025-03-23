export default function BackgroundCircles() {
  return (
    <div className="absolute -z-10" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '140%', height: '140%' }}>
      {/* Circle positioning container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Left circle - E038BC */}
        <div className="absolute w-[350px] h-[350px] rounded-full bg-[#E038BC] opacity-50 blur-3xl" style={{ left: '28%' }}></div>
        
        {/* Middle circle - 35EEDF */}
        <div className="absolute w-[350px] h-[350px] rounded-full bg-[#35EEDF] opacity-50 blur-3xl"></div>
        
        {/* Right circle - 8835EE */}
        <div className="absolute w-[350px] h-[350px] rounded-full bg-[#8835EE] opacity-50 blur-3xl" style={{ right: '28%' }}></div>
      </div>
    </div>
  );
} 