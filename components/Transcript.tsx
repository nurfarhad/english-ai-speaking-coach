import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TranscriptItem, SavedWord } from '../types';

interface TranscriptProps {
  items: TranscriptItem[];
  onSaveWord?: (word: string) => void;
  onCorrectSentence?: (item: TranscriptItem) => void;
  onExplainPhrase?: (phrase: string) => void;
  onPracticePhrase?: (text: string) => void;
}

const Transcript: React.FC<TranscriptProps> = ({ items, onSaveWord, onCorrectSentence, onExplainPhrase, onPracticePhrase }) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items]);

  const replayAudio = (item: TranscriptItem) => {
    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      audio.play();
    } else {
      // Fallback: TTS if we don't have recorded audio
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = item.speaker === 'user' ? 'en-US' : 'en-GB';
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#1e1e20] flex items-center justify-center border border-[#444]">
                <span className="material-icons-round text-gray-500">forum</span>
            </div>
            <p className="text-gray-400 text-sm max-w-[200px] leading-relaxed uppercase font-bold tracking-widest">
                Your conversation history will appear here in real-time.
            </p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`group relative flex flex-col ${item.speaker === 'user' ? 'items-end' : 'items-start'}`}
            onMouseEnter={() => setHoveredItemId(item.id)}
            onMouseLeave={() => setHoveredItemId(null)}
          >
            {/* Timestamp */}
            <span className="text-[10px] font-bold text-gray-500 mb-1 mx-2 uppercase tracking-widest">
                {item.speaker === 'user' ? 'You' : 'Tutor'} • {formatTime(item.timestamp)}
            </span>

            <div className="relative max-w-[85%]">
              <div 
                className={`rounded-2xl px-5 py-4 text-[15px] leading-relaxed shadow-sm transition-all duration-300
                ${item.speaker === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-[#1e1e20] text-gray-200 rounded-tl-none border border-[#333]'
                }
                ${item.isStreaming ? 'opacity-80' : 'opacity-100'}
                `}
              >
                {/* Interactive Text Rendering */}
                <p className="whitespace-pre-wrap">
                    {item.text.split(' ').map((word, i) => (
                        <WordWithTooltip 
                            key={i} 
                            word={word} 
                            onSave={onSaveWord}
                            isUser={item.speaker === 'user'}
                        />
                    ))}
                </p>

                {/* Inline Corrections */}
                {item.speaker === 'user' && item.corrections && item.corrections.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                    {item.corrections.map((corr, i) => (
                      <div key={i} className="text-xs bg-black/20 p-2 rounded-lg">
                        <div className="flex items-center gap-1 text-blue-200 line-through opacity-70">
                           <span>{corr.original}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-300 font-bold">
                           <span className="material-icons-round text-[14px]">check_circle</span>
                           <span>{corr.corrected}</span>
                        </div>
                        <p className="text-[10px] text-blue-100/70 mt-1 italic">{corr.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Menu (Visible on Hover or Active) */}
              <AnimatePresence>
                {(hoveredItemId === item.id || item.isStreaming) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`absolute top-0 flex items-center gap-1 z-20 transition-all
                        ${item.speaker === 'user' ? '-left-12 flex-row-reverse' : '-right-12'}
                    `}
                  >
                    <button 
                        onClick={() => replayAudio(item)}
                        className="w-10 h-10 rounded-full bg-[#2a2a2c] border border-[#444] text-white flex items-center justify-center hover:bg-[#333] hover:border-blue-500 shadow-xl"
                        title="Relisten"
                    >
                        <span className="material-icons-round text-lg">volume_up</span>
                    </button>
                    {item.speaker === 'model' && onPracticePhrase && (
                        <button 
                            onClick={() => onPracticePhrase(item.text)}
                            className="w-10 h-10 rounded-full bg-[#2a2a2c] border border-[#444] text-white flex items-center justify-center hover:bg-[#333] hover:border-blue-500 shadow-xl"
                            title="Mimic Mode"
                        >
                            <span className="material-icons-round text-lg">record_voice_over</span>
                        </button>
                    )}
                    {item.speaker === 'user' && onCorrectSentence && (
                        <button 
                            onClick={() => onCorrectSentence(item)}
                            className="w-10 h-10 rounded-full bg-[#2a2a2c] border border-[#444] text-white flex items-center justify-center hover:bg-[#333] hover:border-green-500 shadow-xl"
                        >
                            <span className="material-icons-round text-lg">auto_fix_high</span>
                        </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Turn Summary/Vocabulary tags if available */}
            {item.vocabulary && item.vocabulary.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {item.vocabulary.map((vocab, i) => (
                        <button 
                            key={i}
                            onClick={() => onExplainPhrase?.(vocab.word)}
                            className="text-[10px] bg-blue-900/20 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-blue-800/40"
                        >
                            <span className="material-icons-round text-[12px]">menu_book</span>
                            {vocab.word}
                        </button>
                    ))}
                </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} className="h-4" />
    </div>
  );
};

interface WordWithTooltipProps {
    word: string;
    onSave?: (w: string) => void;
    isUser: boolean;
}

const WordWithTooltip: React.FC<WordWithTooltipProps> = ({ word, onSave, isUser }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

    const handleWordClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Would you like to save "${cleanWord}" to your vocabulary?`)) {
            onSave?.(cleanWord);
        }
    };

    return (
        <span 
            className="relative inline-block mr-1 cursor-pointer hover:text-blue-300 transition-colors"
            onClick={handleWordClick}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {word}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#1e1e20] border border-[#444] rounded-xl shadow-2xl z-50 pointer-events-none"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-blue-400 text-sm">{cleanWord}</span>
                            <div className="text-yellow-400">
                                <span className="material-icons-round text-sm">bookmark_add</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-tight">
                            Tap to save this word to your persistent vocabulary list.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};

export default Transcript;
