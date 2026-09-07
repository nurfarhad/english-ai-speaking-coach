import React from 'react';
import { motion } from 'motion/react';
import { UserMemory } from '../types';

interface CoachMemoryProps {
  memory: UserMemory;
}

const CoachMemory: React.FC<CoachMemoryProps> = ({ memory }) => {
  return (
    <div className="space-y-6">
      {/* Coach Note Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-icons-round text-6xl text-blue-500">psychology</span>
        </div>
        <h3 className="text-blue-400 text-xs font-bold mb-3 flex items-center gap-2 uppercase tracking-widest">
            <span className="material-icons-round text-sm">auto_awesome</span>
            Coach's Latest Memo
        </h3>
        <p className="text-blue-100 text-lg font-medium leading-relaxed italic pr-12">
            "{memory.coachNotes}"
        </p>
      </motion.div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grammar & Patterns */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1c1c1e] p-5 rounded-2xl border border-white/10"
        >
            <h4 className="text-gray-400 text-xs font-bold mb-4 flex items-center gap-2 uppercase tracking-widest">
                <span className="material-icons-round text-sm text-amber-500">rule</span>
                Recurrent Grammar Focus
            </h4>
            <div className="space-y-2">
                {memory.repeatedGrammarMistakes.length > 0 ? (
                    memory.repeatedGrammarMistakes.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg group hover:bg-white/10 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                            <span className="text-sm text-gray-200">{item}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-400 italic">No patterns detected yet. Speak more to help me learn!</p>
                )}
            </div>

            <h4 className="text-gray-400 text-xs font-bold mt-6 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <span className="material-icons-round text-sm text-purple-500">visibility_off</span>
                Avoided Structures
            </h4>
            <div className="space-y-2">
                {memory.avoidedSentenceStructures.length > 0 ? (
                    memory.avoidedSentenceStructures.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                            <span className="material-icons-round text-xs text-purple-500/50">trending_down</span>
                            <span className="text-sm text-gray-200">{item}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-400 italic">Exploring your range...</p>
                )}
            </div>
        </motion.div>

        {/* Pronunciation & Favorites */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1c1c1e] p-5 rounded-2xl border border-white/10"
        >
            <h4 className="text-gray-400 text-xs font-bold mb-4 flex items-center gap-2 uppercase tracking-widest">
                <span className="material-icons-round text-sm text-red-500">record_voice_over</span>
                Pronunciation Weaknesses
            </h4>
            <div className="flex flex-wrap gap-2">
                {memory.pronunciationWeaknesses.length > 0 ? (
                    memory.pronunciationWeaknesses.map((item, idx) => (
                        <span key={idx} className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-medium">
                            {item}
                        </span>
                    ))
                ) : (
                     <p className="text-xs text-gray-400 italic">Sounds good so far!</p>
                )}
            </div>

            <h4 className="text-gray-400 text-xs font-bold mt-8 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <span className="material-icons-round text-sm text-pink-500">favorite</span>
                Favorite Topics
            </h4>
            <div className="flex flex-wrap gap-2">
                {memory.favoriteTopics.length > 0 ? (
                    memory.favoriteTopics.map((topic, idx) => (
                        <span key={idx} className="bg-white/5 text-gray-300 border border-white/10 px-3 py-1 rounded-lg text-xs font-medium">
                            {topic}
                        </span>
                    ))
                ) : (
                    <p className="text-xs text-gray-400 italic">I'll track what you love talking about.</p>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Speaking Confidence</span>
                    <span className="text-xs text-blue-400 font-bold">{memory.speakingConfidence}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${memory.speakingConfidence}%` }}
                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    />
                </div>
            </div>
        </motion.div>
      </div>

      <div className="text-[11px] text-gray-400 text-center font-bold pt-4 uppercase tracking-widest">
        Synchronized: {new Date(memory.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};

export default CoachMemory;
