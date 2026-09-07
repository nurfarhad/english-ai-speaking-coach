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
    const [confirmingEnd, setConfirmingEnd] = React.useState(false);

    const handleEndClick = () => {
        if (confirmingEnd) {
            onEndCall();
        } else {
            setConfirmingEnd(true);
            setTimeout(() => setConfirmingEnd(false), 3000);
        }
    };

    return (
        <div className="h-24 bg-[#1a1a1c] border-t border-white/5 flex items-center justify-center gap-6 sm:gap-8 shrink-0 z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] px-4">
            <ControlButton 
                icon={<Subtitles size={20} />} 
                active={showTranscript} 
                onClick={onToggleTranscript}
                label="Transcript"
                ariaLabel={showTranscript ? "Hide live transcript" : "Show live transcript"}
                activeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            />

            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleMute}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                aria-pressed={!isMuted}
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
                onClick={handleEndClick}
                aria-label={confirmingEnd ? "Confirm ending speaking session" : "End speaking session"}
                className={`h-14 px-6 sm:px-8 text-white rounded-2xl font-semibold text-sm shadow-2xl flex items-center gap-3 transition-all group ${
                    confirmingEnd 
                        ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/50 animate-pulse' 
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
                }`}
            >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:rotate-90 transition-transform">
                    <PhoneOff size={16} />
                </div>
                <span>{confirmingEnd ? 'Confirm End?' : 'End Session'}</span>
            </motion.button>

            <ControlButton 
                icon={<Lightbulb size={20} />} 
                active={showHints} 
                onClick={onToggleHints}
                label="Hint"
                ariaLabel={showHints ? "Hide conversational hints" : "Show conversational hints"}
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
    ariaLabel,
    activeColor 
}: { 
    icon: React.ReactNode, 
    active: boolean, 
    onClick: () => void, 
    label: string,
    ariaLabel?: string,
    activeColor: string 
}) => (
    <button 
        onClick={onClick}
        aria-label={ariaLabel || label}
        aria-pressed={active}
        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 border ${
            active 
                ? activeColor 
                : 'text-gray-400 hover:text-gray-200 bg-transparent border-transparent hover:bg-white/5'
        }`}
    >
        {icon}
        <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
);

export default CallControls;
