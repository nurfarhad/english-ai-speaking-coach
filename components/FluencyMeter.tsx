import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Activity } from 'lucide-react';

interface FluencyMeterProps {
    fluency: number; // 0 to 100
    isUserSpeaking: boolean;
}

const FluencyMeter: React.FC<FluencyMeterProps> = ({ fluency, isUserSpeaking }) => {
    // Determine color based on fluency
    const getColor = () => {
        if (fluency >= 80) return 'text-emerald-400';
        if (fluency >= 60) return 'text-orange-400';
        return 'text-rose-400';
    };

    const getBgColor = () => {
        if (fluency >= 80) return 'bg-emerald-500';
        if (fluency >= 60) return 'bg-orange-500';
        return 'bg-rose-500';
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <Activity size={14} className={getColor()} />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fluency Pulse</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <motion.span 
                        animate={{ scale: isUserSpeaking ? [1, 1.1, 1] : 1 }}
                        className={`text-2xl font-bold tracking-tight ${getColor()}`}
                    >
                        {Math.round(fluency)}
                    </motion.span>
                    <span className="text-xs font-semibold text-gray-700">%</span>
                </div>
            </div>

            <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                {/* Background static glow */}
                <div className={`absolute inset-0 opacity-10 blur-md ${getBgColor()}`} />
                
                {/* Fluency level bar */}
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${fluency}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 25 }}
                    className={`h-full relative z-10 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] ${getBgColor()}`}
                >
                    {/* Inner highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[30%] bg-white/20 rounded-full" />
                    
                    {/* Active pulse head */}
                    <motion.div 
                        animate={{ 
                            opacity: isUserSpeaking ? [1, 0.4, 1] : 0,
                            scale: isUserSpeaking ? [1, 1.5, 1] : 1
                        }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-md opacity-50"
                    />
                </motion.div>

                {/* Grid markings */}
                <div className="absolute inset-0 z-20 flex justify-between px-1 pointer-events-none">
                    {[...Array(11)].map((_, i) => (
                        <div key={i} className="w-px h-full bg-black/20" />
                    ))}
                </div>
            </div>

            <div className="mt-4 flex justify-between text-[10px] font-bold text-gray-600 px-1 uppercase tracking-widest">
                <span>Training</span>
                <span>Fluent</span>
                <span>Native</span>
            </div>
        </div>
    );
};

export default FluencyMeter;
