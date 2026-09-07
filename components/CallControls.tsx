import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, PhoneOff, Lightbulb, Subtitles, HelpCircle } from 'lucide-react';

interface CallControlsProps {
    isMuted: boolean;
    showHints: boolean;
    showTranscript: boolean;
    onToggleMute: () => void;
    onToggleHints: () => void;
    onToggleTranscript: () => void;
    onEndCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
    isMuted,
    showHints,
    showTranscript,
    onToggleMute,
    onToggleHints,
    onToggleTranscript,
    onEndCall
}) => {
    return (
        <div className="h-24 bg-[#1a1a1c] border-t border-white/5 flex items-center justify-center gap-8 shrink-0 z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <ControlButton 
                icon={<Subtitles size={20} />} 
                active={showTranscript} 
                onClick={onToggleTranscript}
                label="Transcript"
                activeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            />

            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleMute}
                className={`h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative group ${
                    isMuted 
                        ? 'bg-orange-600 text-white shadow-orange-900/40' 
                        : 'bg-[#232325] text-white hover:bg-[#2a2a2c] border border-white/10'
                }`}
            >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                <div className={`absolute -inset-1 rounded-full animate-pulse opacity-20 ${isMuted ? 'bg-orange-500' : 'bg-emerald-500'}`} />
            </motion.button>

            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEndCall}
                className="h-14 px-8 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-semibold text-sm shadow-2xl shadow-rose-900/40 flex items-center gap-3 transition-all group"
            >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:rotate-90 transition-transform">
                    <PhoneOff size={16} />
                </div>
                <span>End Session</span>
            </motion.button>

            <ControlButton 
                icon={<Lightbulb size={20} />} 
                active={showHints} 
                onClick={onToggleHints}
                label="Hint"
                activeColor="bg-orange-500/10 text-orange-400 border-orange-500/20"
            />
        </div>
    );
};

const ControlButton = ({ 
    icon, 
    active, 
    onClick, 
    label, 
    activeColor 
}: { 
    icon: React.ReactNode, 
    active: boolean, 
    onClick: () => void, 
    label: string,
    activeColor: string 
}) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 border ${
            active 
                ? activeColor 
                : 'text-gray-600 hover:text-gray-300 bg-transparent border-transparent hover:bg-white/2'
        }`}
    >
        {icon}
        <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
);

export default CallControls;
