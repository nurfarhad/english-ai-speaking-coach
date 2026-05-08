import React from 'react';
import { motion } from 'motion/react';
import { SPEAK_LIKE_STYLES } from '../constants';
import { SpeakLikeStyle } from '../types';

interface SpeakLikeSelectorProps {
    selectedStyleId: string | null;
    onSelect: (style: SpeakLikeStyle | null) => void;
}

const SpeakLikeSelector: React.FC<SpeakLikeSelectorProps> = ({ selectedStyleId, onSelect }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Practice speaking like...</h3>
                {selectedStyleId && (
                    <button 
                        onClick={() => onSelect(null)}
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                    >
                        Clear Style
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SPEAK_LIKE_STYLES.map((style) => (
                    <motion.button
                        key={style.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(style)}
                        className={`relative p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 group ${
                            selectedStyleId === style.id 
                            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                            : 'bg-[#1c1c1e] border-white/5 hover:border-white/10'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-2xl">{style.emoji}</span>
                            {selectedStyleId === style.id && (
                                <motion.span 
                                    layoutId="style-check"
                                    className="material-icons-round text-blue-400 text-lg"
                                >
                                    check_circle
                                </motion.span>
                            )}
                        </div>
                        <div>
                            <div className={`text-xs font-bold transition-colors ${selectedStyleId === style.id ? 'text-white' : 'text-gray-300'}`}>
                                {style.label}
                            </div>
                            <div className="text-[10px] text-gray-500 line-clamp-1 group-hover:line-clamp-none transition-all">
                                {style.description}
                            </div>
                        </div>
                        
                        {/* Style Traits Tooltip on hover */}
                        <div className="absolute inset-x-0 -bottom-1 translate-y-full opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 pt-2">
                            <div className="bg-gray-900 border border-white/10 p-3 rounded-xl shadow-2xl text-[10px]">
                                <div className="text-blue-400 font-bold mb-1">Focus Areas:</div>
                                <div className="flex flex-wrap gap-1">
                                    {style.targetTraits.map(t => (
                                        <span key={t} className="bg-white/5 px-1.5 py-0.5 rounded text-gray-400">#{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default SpeakLikeSelector;
