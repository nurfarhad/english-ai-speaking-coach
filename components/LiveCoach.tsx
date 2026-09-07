import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Gauge, Zap, TrendingUp, Waves, Sparkles, AlertCircle } from 'lucide-react';
import { RealTimeMetrics } from '../types';

interface LiveCoachProps {
  metrics: RealTimeMetrics;
  isUserSpeaking: boolean;
}

const LiveCoach: React.FC<LiveCoachProps> = ({ metrics, isUserSpeaking }) => {
  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Real-time Feedback HUD */}
      <div className="h-14 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {isUserSpeaking && metrics.currentFeedback && (
            <motion.div
              key={metrics.currentFeedback}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="px-8 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.1)] flex items-center gap-3"
            >
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              <span className="text-emerald-500 font-semibold text-sm leading-none mb-0.5">
                {metrics.currentFeedback}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0">
        <MetricCard 
          label="Confidence" 
          value={metrics.pronunciationConfidence} 
          icon={<CheckCircle2 size={18} />} 
          color="text-emerald-400"
          accent="bg-emerald-400"
          suffix="%"
        />
        <MetricCard 
          label="Velocity" 
          value={metrics.speakingSpeed} 
          icon={<Gauge size={18} />} 
          color="text-orange-400"
          accent="bg-orange-400"
          suffix="wpm"
        />
        <MetricCard 
          label="Fluency" 
          value={metrics.fluency} 
          icon={<TrendingUp size={18} />} 
          color="text-emerald-300"
          accent="bg-emerald-300"
          suffix="%"
        />
        <MetricCard 
          label="Energy" 
          value={metrics.prosody?.rhythm || 85} 
          icon={<Zap size={18} />} 
          color="text-orange-500"
          accent="bg-orange-500"
          suffix="pts"
        />
      </div>

      {/* Rhythmic Pulse Indicator */}
      <div className="flex justify-center gap-1.5 h-12 items-center">
        {[...Array(12)].map((_, i) => (
            <motion.div 
                key={i}
                animate={{ 
                    height: isUserSpeaking ? [6, 12 + Math.random() * 24, 6] : 6,
                    opacity: isUserSpeaking ? [0.3, 1, 0.3] : 0.1 
                }}
                transition={{ 
                    repeat: Infinity, 
                    duration: 0.5 + Math.random() * 0.3, 
                    delay: i * 0.04 
                }}
                className="w-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            />
        ))}
      </div>

      {/* Filler Words Detected */}
      <AnimatePresence>
        {metrics.fillerWords.length > 0 && isUserSpeaking && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 justify-center bg-orange-500/5 border border-orange-500/20 py-2 px-4 rounded-2xl"
          >
            <AlertCircle size={12} className="text-orange-500" />
            <span className="text-[10px] font-bold text-orange-500/80 uppercase tracking-widest">Pace Interruption:</span>
            <div className="flex gap-2">
                {metrics.fillerWords.map((word, i) => (
                <span key={i} className="text-xs font-semibold text-orange-400">
                    "{word}"
                </span>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MetricCard = ({ label, value, icon, color, accent, suffix }: { label: string, value: number, icon: React.ReactNode, color: string, accent: string, suffix: string }) => (
  <div className="bg-[#1e1e20] border border-white/10 rounded-3xl p-5 flex flex-col items-center shadow-2xl relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-12 h-12 ${accent}/5 blur-2xl group-hover:${accent}/10 transition-colors`}></div>
    <div className={`p-2.5 rounded-2xl bg-white/5 mb-3 ${color} shadow-inner`}>
      {icon}
    </div>
    <span className="text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-white tracking-tight leading-none">
        {Math.round(value)}
      </span>
      <span className="text-[10px] text-gray-400 font-medium">{suffix}</span>
    </div>
    
    {/* Minimal progress bar */}
    <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden shadow-inner">
      <motion.div 
        animate={{ width: `${Math.min(100, (value / (suffix.includes('wpm') ? 200 : 100)) * 100)}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`h-full ${accent} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
      />
    </div>
  </div>
);

export default LiveCoach;
