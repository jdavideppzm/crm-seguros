import { motion } from "framer-motion";

interface JedaelLogoProps {
  className?: string;
  src?: string;
}

export function JedaelLogo({ className = "w-20 h-20", src }: JedaelLogoProps) {
  if (src) {
    return (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`relative ${className} flex items-center justify-center`}
      >
        <img src={src} alt="Logo" className="w-full h-full object-contain drop-shadow-2xl" />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative ${className}`}
    >
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_25px_rgba(139,92,246,0.3)]">
        <defs>
          <linearGradient id="jdShieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E40AF" /> {/* Blue-900ish */}
            <stop offset="50%" stopColor="#7C3AED" /> {/* Violet-600 */}
            <stop offset="100%" stopColor="#9333EA" /> {/* Purple-600 */}
          </linearGradient>
          <filter id="jdGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shield Outer Glow/Border */}
        <path 
          d="M100 15C100 15 165 30 175 85C185 145 100 185 100 185C100 185 15 145 25 85C35 30 100 15 100 15Z" 
          fill="rgba(255, 255, 255, 0.05)"
        />
        
        {/* Main Shield */}
        <path 
          d="M100 20C100 20 160 35 170 90C180 145 100 180 100 180C100 180 20 145 30 90C40 35 100 20 100 20Z" 
          fill="url(#jdShieldGradient)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />

        {/* Interior Shield Highlight */}
        <path 
          d="M100 28C100 28 150 42 160 90C170 140 100 170 100 170C100 170 30 140 40 90C50 42 100 28 100 28Z" 
          fill="rgba(255, 255, 255, 0.1)"
        />

        {/* JD Typography inside Shield */}
        <text 
          x="100" 
          y="115" 
          textAnchor="middle" 
          fill="white" 
          fontSize="68" 
          fontWeight="900" 
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-4px", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }}
        >
          JD
        </text>

        {/* Accent Shine */}
        <path 
          d="M100 20C120 30 160 50 170 90C172 100 170 120 160 140C150 120 120 100 100 95" 
          fill="white" 
          opacity="0.1"
        />
      </svg>
    </motion.div>
  );
}

export function JedaelText() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-5xl font-black tracking-[-0.04em] text-white uppercase flex items-center gap-1">
        JEDAEL
      </h1>
      <div className="flex items-center gap-2 mt-1">
        <div className="h-px w-6 bg-gradient-to-r from-transparent to-slate-500" />
        <span className="text-[11px] font-black text-slate-400 tracking-[0.3em] uppercase whitespace-nowrap">
          Tu vida, protegida.
        </span>
        <div className="h-px w-6 bg-gradient-to-l from-transparent to-slate-500" />
      </div>
    </div>
  );
}
