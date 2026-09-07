import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Headphones, X, Mic2 } from 'lucide-react';
import { MimicAttempt, ProsodyMetrics } from '../types';

interface MimicTrainerProps {
    phrase: string;
    nativeVoice: string;
    onAttempt: (audio: Blob) => Promise<MimicAttempt>;
    onClose: () => void;
}

const ProsodyBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
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
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
                setIsAnalyzing(true);
                try {
                    const result = await onAttempt(blob);
                    setLastAttempt(result);
                } catch (err: any) {
                    setError("Analysis failed. Please try again.");
                }
                setIsAnalyzing(false);
            };

            recorder.start();
            setIsRecording(true);
        } catch (err: any) {
            console.error("Failed to start recording", err);
            if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No microphone found. Please connect one.');
            } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Microphone access denied.');
            } else {
                setError('Could not access microphone.');
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
        }
    };

    const playNative = () => {
        const utterance = new SpeechSynthesisUtterance(phrase);
        // Try to match the language if possible, otherwise default
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
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
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Headphones className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight uppercase tracking-widest">Speech Lab</h2>
                            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Accent Mastery Trainer</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10 space-y-10">
                    {/* The Target Phrase */}
                    <div className="text-center space-y-6">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Listen & Repeat</span>
                        <div className="relative">
                            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight px-12">
                                "{phrase}"
                            </h1>
                            <div className="absolute top-0 right-0 opacity-10">
                                <span className="material-icons-round text-8xl text-blue-400">format_quote</span>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button 
                                onClick={playNative}
                                className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-emerald-400 font-bold text-sm transition-colors border border-white/5 uppercase tracking-widest"
                            >
                                <Headphones size={16} />
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
                                    <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest">Analyzing Prosody...</p>
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
                                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl relative ${isRecording ? 'bg-orange-600 scale-110 shadow-orange-600/40' : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-600/40'}`}
                                    >
                                        <AnimatePresence>
                                            {isRecording && (
                                                <motion.div 
                                                    initial={{ scale: 1, opacity: 0.5 }}
                                                    animate={{ scale: 1.5, opacity: 0 }}
                                                    transition={{ repeat: Infinity, duration: 1 }}
                                                    className="absolute inset-0 rounded-full bg-orange-600"
                                                />
                                            )}
                                        </AnimatePresence>
                                        {isRecording ? <div className="w-8 h-8 rounded-sm bg-white" /> : <Mic2 size={36} />}
                                    </button>
                                    <p className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        {isRecording ? 'Release to stop' : 'Hold to mimic'}
                                    </p>
                                    {error && (
                                        <p className="mt-4 text-[10px] text-rose-500 font-bold uppercase tracking-widest animate-pulse">
                                            {error}
                                        </p>
                                    )}
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
                                        <h3 className="font-bold text-white uppercase tracking-widest">Speech Analysis</h3>
                                        <div className="px-3 py-1 bg-blue-600/10 rounded-full text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                            Score: {lastAttempt.prosodyScore}%
                                        </div>
                                    </div>
                                    {lastAttempt.transcription && (
                                        <div className="p-4 bg-black/20 rounded-xl border border-white/10">
                                            <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">What the AI Heard:</p>
                                            <p className="text-white italic">"{lastAttempt.transcription}"</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                        <ProsodyBar label="Stress" value={85} color="bg-blue-500" />
                                        <ProsodyBar label="Rhythm" value={lastAttempt.prosodyScore} color="bg-emerald-500" />
                                        <ProsodyBar label="Pitch" value={70} color="bg-purple-500" />
                                        <ProsodyBar label="Pacing" value={92} color="bg-amber-500" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-white text-sm uppercase tracking-widest">Phoneme Breakdown</h3>
                                    <div className="bg-[#131314] rounded-2xl p-6 border border-white/10 flex flex-wrap gap-4">
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
                                    <p className="text-[10px] text-gray-400 italic leading-relaxed uppercase">
                                        Focus on the 'th' sound; place your tongue behind your front teeth slightly more.
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
