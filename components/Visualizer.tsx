import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic2, Headphones } from 'lucide-react';

interface VisualizerProps {
  volume: number; // 0 to 1
  isConnected: boolean;
  isUserSpeaking?: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ volume, isConnected, isUserSpeaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current || !isConnected) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const layers = 3;
      const baseAmplitude = 20 * volume;
      
      for (let l = 0; l < layers; l++) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = isUserSpeaking 
          ? `rgba(16, 185, 129, ${0.4 / (l+1)})` // Emerald for User
          : `rgba(249, 115, 22, ${0.4 / (l+1)})`; // Orange for Model
        
        ctx.lineCap = 'round';
        
        const frequency = 0.02 + (l * 0.01);
        const amplitude = baseAmplitude * (layers - l) / layers;
        const phase = phaseRef.current + (l * Math.PI / 2);

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * frequency + phase) * amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      phaseRef.current += 0.1 + (volume * 0.2);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isConnected, volume, isUserSpeaking]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48 flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 rounded-full border-2 border-emerald-500/10"
            />
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full border border-emerald-500/20"
            />
            <div className="w-20 h-20 rounded-full bg-[#1e1e20] flex items-center justify-center shadow-2xl border border-[#333]">
                <Mic2 size={32} className="text-emerald-500/30" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center h-80 w-80">
        {/* Animated Background Glow */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={isUserSpeaking ? 'user' : 'model'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 + (volume * 0.4) }}
            className={`absolute inset-0 rounded-full blur-[80px] transition-colors duration-500 ${isUserSpeaking ? 'bg-emerald-600/20' : 'bg-orange-600/20'}`}
          />
        </AnimatePresence>

        {/* Waveform Canvas */}
        <canvas 
          ref={canvasRef} 
          width={320} 
          height={320} 
          className="absolute inset-0 z-0 opacity-80 pointer-events-none"
        />
        
        {/* Core Orb */}
        <motion.div 
          animate={{ 
            scale: 1 + (volume * 0.4),
            boxShadow: `0 0 ${40 + (volume * 60)}px ${isUserSpeaking ? 'rgba(16, 185, 129, 0.4)' : 'rgba(249, 115, 22, 0.4)'}`
          }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center border-[6px] border-[#131314] overflow-hidden
            ${isUserSpeaking 
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-400' 
              : 'bg-gradient-to-br from-orange-500 to-orange-400'}
          `}
        >
             <motion.span 
               animate={{ y: [0, -2, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="text-white/95"
             >
               {isUserSpeaking ? <Mic2 size={48} /> : <Headphones size={48} />}
             </motion.span>
             
             {/* Liquid fill effect */}
             <motion.div 
               animate={{ 
                 top: `${100 - (volume * 100)}%`,
                 rotate: 360
               }}
               transition={{ rotate: { repeat: Infinity, duration: 4, ease: 'linear' } }}
               className="absolute inset-0 bg-white/10 rounded-[40%] translate-y-2 pointer-events-none"
             />
        </motion.div>

        {/* Dynamic Rings */}
        {[0, 1, 2].map((i) => (
          <motion.div 
            key={i}
            animate={{ 
              scale: [1, 1.5 + (volume * 0.5)],
              opacity: [0.3, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2, 
              delay: i * 0.6,
              ease: 'easeOut'
            }}
            className={`absolute w-32 h-32 rounded-full border-2 ${isUserSpeaking ? 'border-emerald-500/40' : 'border-orange-500/40'}`}
          />
        ))}
    </div>
  );
};

export default Visualizer;