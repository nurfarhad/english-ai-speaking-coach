import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RealTimeMetrics } from '../types';

interface LiveCoachProps {
  metrics: RealTimeMetrics;
  isUserSpeaking: boolean;
}

const LiveCoach: React.FC<LiveCoachProps> = ({ metrics, isUserSpeaking }) => {
  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Real-time Feedback HUD */}
      <div className="h-12 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {isUserSpeaking && metrics.currentFeedback && (
            <motion.div
              key={metrics.currentFeedback}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="px-6 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full backdrop-blur-md"
            >
              <span className="text-blue-100 font-medium tracking-wide">
                {metrics.currentFeedback}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          label="Confidence" 
          value={metrics.pronunciationConfidence} 
          icon="check_circle" 
          color="text-green-400"
          suffix="%"
        />
        <MetricCard 
          label="Speed" 
          value={metrics.speakingSpeed} 
          icon="speed" 
          color="text-blue-400"
          suffix=" wpm"
        />
        <MetricCard 
          label="Fluency" 
          value={metrics.fluency} 
          icon="trending_up" 
          color="text-purple-400"
          suffix="%"
        />
        <MetricCard 
          label="Prosody" 
          value={metrics.prosody?.rhythm || 85} 
          icon="equalizer" 
          color="text-amber-400"
          suffix=" pts"
        />
      </div>

      {/* Rhythmic Pulse Indicator */}
      <div className="flex justify-center gap-1">
        {[...Array(8)].map((_, i) => (
            <motion.div 
                key={i}
                animate={{ 
                    height: isUserSpeaking ? [4, 8 + Math.random() * 20, 4] : 4,
                    opacity: isUserSpeaking ? [0.4, 1, 0.4] : 0.2 
                }}
                transition={{ 
                    repeat: Infinity, 
                    duration: 0.5, 
                    delay: i * 0.05 
                }}
                className="w-1.5 bg-blue-500 rounded-full"
            />
        ))}
      </div>

      {/* Filler Words Detected */}
      <AnimatePresence>
        {metrics.fillerWords.length > 0 && isUserSpeaking && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 justify-center"
          >
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Filler Detected:</span>
            {metrics.fillerWords.map((word, i) => (
              <span key={i} className="text-xs bg-red-900/20 text-red-400 px-2 py-0.5 rounded border border-red-500/20 border-dashed">
                "{word}"
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MetricCard = ({ label, value, icon, color, suffix }: { label: string, value: number, icon: string, color: string, suffix: string }) => (
  <div className="bg-[#1e1e20] border border-[#333] rounded-2xl p-4 flex flex-col items-center shadow-lg">
    <div className={`p-2 rounded-lg bg-gray-900/50 mb-2 ${color}`}>
      <span className="material-icons-round text-lg">{icon}</span>
    </div>
    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-mono font-bold text-white leading-none">
        {Math.round(value)}
      </span>
      <span className="text-[10px] text-gray-400 font-medium uppercase">{suffix}</span>
    </div>
    
    {/* Minimal progress bar */}
    <div className="w-full h-1 bg-gray-800 rounded-full mt-3 overflow-hidden">
      <motion.div 
        animate={{ width: `${Math.min(100, (value / (suffix.includes('wpm') ? 200 : 100)) * 100)}%` }}
        className={`h-full ${color.replace('text', 'bg')}`}
      />
    </div>
  </div>
);

export default LiveCoach;
