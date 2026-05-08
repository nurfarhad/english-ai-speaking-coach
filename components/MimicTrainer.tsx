import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MimicAttempt, ProsodyMetrics } from '../types';

interface MimicTrainerProps {
    phrase: string;
    nativeVoice: string;
    onAttempt: (audio: Blob) => Promise<MimicAttempt>;
    onClose: () => void;
}

const ProsodyBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                className={`h-full ${color}`}
            />
        </div>
    </div>
);

const MimicTrainer: React.FC<MimicTrainerProps> = ({ phrase, nativeVoice, onAttempt, onClose }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [lastAttempt, setLastAttempt] = useState<MimicAttempt | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
                setIsAnalyzing(true);
                const result = await onAttempt(blob);
                setLastAttempt(result);
                setIsAnalyzing(false);
            };

            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
    };

    return (
        <div className="fixed inset-0 bg-[#131314]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1e1e20] w-full max-w-3xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <span className="material-icons-round text-white">graphic_eq</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Mimic Mode</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Accent Mastery Trainer</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                <div className="p-10 space-y-10">
                    {/* The Target Phrase */}
                    <div className="text-center space-y-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Listen & Repeat</span>
                        <div className="relative">
                            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight px-12">
                                "{phrase}"
                            </h1>
                            <div className="absolute top-0 right-0 opacity-10">
                                <span className="material-icons-round text-8xl text-blue-400">format_quote</span>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-blue-400 font-bold text-sm transition-colors border border-white/5">
                                <span className="material-icons-round">volume_up</span>
                                Hear Native Pronunciation
                            </button>
                        </div>
                    </div>

                    {/* Interaction Zone */}
                    <div className="flex flex-col items-center justify-center py-10 relative">
                        <AnimatePresence mode="wait">
                            {isAnalyzing ? (
                                <motion.div 
                                    key="analyzing"
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-blue-400 font-bold uppercase tracking-widest text-[10px]">Analyzing Prosody...</p>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="controls"
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center"
                                >
                                    <button 
                                        onMouseDown={startRecording}
                                        onMouseUp={stopRecording}
                                        onTouchStart={startRecording}
                                        onTouchEnd={stopRecording}
                                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl relative ${isRecording ? 'bg-red-600 scale-110 shadow-red-600/40' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/40'}`}
                                    >
                                        <AnimatePresence>
                                            {isRecording && (
                                                <motion.div 
                                                    initial={{ scale: 1, opacity: 0.5 }}
                                                    animate={{ scale: 1.5, opacity: 0 }}
                                                    transition={{ repeat: Infinity, duration: 1 }}
                                                    className="absolute inset-0 rounded-full bg-red-600"
                                                />
                                            )}
                                        </AnimatePresence>
                                        <span className="material-icons-round text-4xl text-white relative z-10">
                                            {isRecording ? 'graphic_eq' : 'mic'}
                                        </span>
                                    </button>
                                    <p className="mt-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        {isRecording ? 'Release to Stop' : 'Hold to Mimic'}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Results Display */}
                    <AnimatePresence>
                        {lastAttempt && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-white">Speech Analysis</h3>
                                        <div className="px-3 py-1 bg-blue-600/10 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                            Score: {lastAttempt.prosodyScore}%
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                        <ProsodyBar label="Stress" value={85} color="bg-blue-500" />
                                        <ProsodyBar label="Rhythm" value={lastAttempt.prosodyScore} color="bg-emerald-500" />
                                        <ProsodyBar label="Pitch" value={70} color="bg-purple-500" />
                                        <ProsodyBar label="Pacing" value={92} color="bg-amber-500" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-white text-sm">Phoneme Breakdown</h3>
                                    <div className="bg-[#131314] rounded-2xl p-6 border border-white/5 flex flex-wrap gap-4">
                                        {lastAttempt.phonemeFeedback.map((p, i) => (
                                            <div key={i} className="flex flex-col items-center gap-1 group cursor-help">
                                                <span className={`text-lg font-mono font-bold ${p.score > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>/{p.phoneme}/</span>
                                                <div className="h-1 w-6 rounded-full bg-gray-800 overflow-hidden">
                                                    <div className={`h-full ${p.score > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${p.score}%` }} />
                                                </div>
                                                {p.suggestion && (
                                                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black p-2 rounded text-[10px] text-gray-400 -mt-20 pointer-events-none border border-white/10 w-24">
                                                        {p.suggestion}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic leading-relaxed">
                                        "Focus on the 'th' sound; place your tongue behind your front teeth slightly more."
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default MimicTrainer;
