import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AnalysisReport } from '../types';
import ShareCard from './ShareCard';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';

interface ReportCardProps {
  report: AnalysisReport;
  onClose: () => void;
}

const MetricCard = ({ 
  label, 
  value, 
  color, 
  icon, 
  description, 
  suffix = "%",
  delay = 0 
}: { 
  label: string, 
  value: number, 
  color: string, 
  icon: string, 
  description: string,
  suffix?: string,
  delay?: number 
}) => {
  const coachingLabel = value >= 90 ? "Excellent" : value >= 80 ? "Great job" : value >= 70 ? "Good progress" : "Keep practicing";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#1e1e20] rounded-3xl p-6 border border-[#333] shadow-xl hover:border-white/10 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color.replace('text', 'bg').replace('-400', '-500/10')}`}>
          <span className={`material-icons-round ${color}`}>{icon}</span>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{coachingLabel}</span>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-bold text-white">{value}</span>
            <span className="text-sm font-medium text-gray-500">{suffix}</span>
          </div>
        </div>
      </div>
      <h3 className="font-bold text-white text-sm mb-1">{label}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      
      {/* Mini Progress Bar */}
      <div className="w-full h-1.5 bg-gray-800 rounded-full mt-4 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${color.replace('text', 'bg')}`}
        />
      </div>
    </motion.div>
  );
};

const HeatmapItem: React.FC<{ value: number }> = ({ value }) => {
  const opacity = 0.1 + (value / 100) * 0.9;
  return (
    <div 
      className="aspect-square rounded-md border border-white/5 transition-transform hover:scale-110 cursor-help"
      style={{ backgroundColor: `rgba(96, 165, 250, ${opacity})` }}
      title={`Pronunciation Accuracy: ${value}%`}
    />
  );
};

const ReportCard: React.FC<ReportCardProps> = ({ report, onClose }) => {
  const [showShare, setShowShare] = useState(false);
  const chartData = report.performanceData.map((val, i) => ({
    name: `Turn ${i + 1}`,
    value: val,
    engagement: 40 + (Math.random() * 50) // Mock engagement secondary curve
  }));

  return (
    <div className="w-full h-full bg-[#131314] flex flex-col animate-fade-in overflow-hidden">
        
        {/* Modern Navbar */}
        <div className="flex items-center justify-between p-6 bg-[#1e1e20] shrink-0 z-20 shadow-2xl">
            <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-2xl font-black text-white">{report.score}</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">AI Speaking Insights</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Analysis Session</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span className="text-[10px] uppercase font-bold text-gray-500">
                          {report.score >= 80 ? "You sounded confident" : "Great progress today"}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowShare(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl transition-all flex items-center gap-2 font-bold text-sm shadow-xl shadow-purple-600/20"
                >
                    <span className="material-icons-round text-lg">share</span>
                    Share Result
                </button>
                <button 
                    onClick={onClose}
                    className="px-6 py-3 bg-[#2a2a2c] hover:bg-[#333] text-white rounded-2xl transition-all flex items-center gap-2 font-bold text-sm border border-[#444]"
                >
                    <span className="material-icons-round text-lg">close</span>
                    Back to Scenarios
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all flex items-center gap-2 font-bold text-sm shadow-xl shadow-blue-600/20"
                >
                    <span className="material-icons-round text-lg">refresh</span>
                    Try Again
                </button>
            </div>
        </div>

        {/* Dashboard Frame */}
        <div className="flex-1 overflow-y-auto bg-[#131314] p-8">
            <div className="max-w-7xl mx-auto space-y-8 pb-20">
                
                {/* Visual Overview: Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Speak Like Style Highlight */}
                    {report.styleScore && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="lg:col-span-12 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 rounded-[32px] p-1 border-2 border-blue-500/20 shadow-2xl overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                            <div className="relative bg-[#1e1e20]/90 backdrop-blur-xl rounded-[30px] p-8 flex flex-col md:flex-row items-center gap-8">
                                <div className="shrink-0 relative">
                                    <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(37,99,235,0.4)] animate-pulse">
                                        {report.styleScore.score > 80 ? '🌟' : '🎯'}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-[#1e1e20]">
                                        {report.styleScore.score}
                                    </div>
                                </div>
                                
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Mastering Style</h3>
                                        <div className="h-px w-12 bg-blue-500/30" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">{report.styleScore.styleName}</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter mb-3">
                                        You sounded just like a {report.styleScore.styleName}!
                                    </h2>
                                    <p className="text-gray-400 max-w-2xl leading-relaxed">
                                        {report.styleScore.feedback}
                                    </p>
                                </div>

                                <div className="shrink-0 flex gap-4">
                                    <div className="text-center px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Rhythm</div>
                                        <div className="text-2xl font-black text-blue-400">Match</div>
                                    </div>
                                    <div className="text-center px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Tone</div>
                                        <div className="text-2xl font-black text-purple-400">Expert</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Main Performance Timeline */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="lg:col-span-8 bg-[#1e1e20] rounded-[32px] p-8 border border-[#333] shadow-2xl overflow-hidden relative"
                    >
                         <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white">Conversation Performance</h3>
                                <p className="text-sm text-gray-500">Your flow and accuracy over time</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-xs text-gray-400 font-medium">Flow</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                                    <span className="text-xs text-gray-400 font-medium">Engagement</span>
                                </div>
                            </div>
                         </div>
                         
                         <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a2c" />
                                    <XAxis dataKey="name" stroke="#555" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: '#1e1e20', border: '1px solid #444', borderRadius: '12px' }}
                                      itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                                    <Area type="monotone" dataKey="engagement" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorEngage)" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                         </div>
                    </motion.div>

                    {/* Pronunciation Heatmap & Pacing */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="lg:col-span-4 space-y-8"
                    >
                         <div className="bg-[#1e1e20] rounded-[32px] p-8 border border-[#333] shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white">Pronunciation Heatmap</h3>
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <span className="material-icons-round text-blue-400 text-sm">grid_view</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <HeatmapItem key={i} value={70 + Math.random() * 30} />
                                ))}
                            </div>
                            <p className="mt-6 text-xs text-gray-500 leading-relaxed italic">
                              "High accuracy detected in complex syllable transitions."
                            </p>
                         </div>

                         <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform">
                                <span className="material-icons-round text-6xl">speed</span>
                             </div>
                             <h3 className="font-black text-[10px] uppercase tracking-widest mb-2 opacity-70">Pacing Score</h3>
                             <div className="text-4xl font-black mb-1">
                                {report.pacingScore >= 80 ? 'Perfect' : 'Good'}
                             </div>
                             <p className="text-sm opacity-80 font-medium">Your pacing improved significantly mid-conversation.</p>
                             <div className="mt-8 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold opacity-60">Avg. Speed</span>
                                    <span className="font-bold">142 WPM</span>
                                </div>
                                <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center font-black text-xl">
                                    {report.pacingScore}
                                </div>
                             </div>
                         </div>
                    </motion.div>
                </div>

                {/* Main Metrics Dashboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    <MetricCard 
                      label="Richness" 
                      value={report.vocabularyRichness} 
                      color="text-emerald-400" 
                      icon="auto_awesome" 
                      description="Advanced word choices"
                    />
                    <MetricCard 
                      label="Confidence" 
                      value={report.confidenceScore} 
                      color="text-blue-400" 
                      icon="electric_bolt" 
                      description="Assertiveness in speech"
                    />
                    <MetricCard 
                      label="Grammar" 
                      value={report.grammarConsistency} 
                      color="text-amber-400" 
                      icon="rule" 
                      description="Syntactical accuracy"
                    />
                    <MetricCard 
                      label="Matching" 
                      value={report.accentMatchScore} 
                      color="text-purple-400" 
                      icon="record_voice_over" 
                      description="Target accent phrasing"
                    />
                    <div className="bg-[#1e1e20] rounded-3xl p-6 border border-[#333] flex flex-col justify-center items-center group">
                        <div className="mb-2 p-3 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                            <span className="material-icons-round text-red-400">error_outline</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Filler Words</span>
                        <div className="text-4xl font-black text-white">{report.fillerWordsDetected}</div>
                        <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Minimal Hesitation</p>
                    </div>
                </div>

                {/* Detailed Analysis Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Tutor Feedback Card */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#1e1e20] rounded-[32px] p-8 border border-[#333] shadow-xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 underline decoration-blue-400/30">
                                <span className="material-icons-round text-xl">psychology</span>
                            </div>
                            <h3 className="font-bold text-lg text-white">AI Analysis</h3>
                        </div>
                        <p className="text-gray-300 leading-relaxed italic text-[15px]">
                            "{report.summary}"
                        </p>
                        
                        <div className="mt-8 space-y-6">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 block">Personalized Tips</span>
                                <div className="space-y-3">
                                    {report.suggestions.map((tip, i) => (
                                        <div key={i} className="flex gap-4 items-start group">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 shrink-0">
                                                <span className="text-[10px] font-bold">{i+1}</span>
                                            </div>
                                            <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Highlights & Weak Points */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#1e1e20] rounded-[32px] p-8 border border-[#333] shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                                    <span className="material-icons-round">verified</span>
                                </div>
                                <h3 className="font-bold text-lg text-white">Top Achievements</h3>
                            </div>
                            <ul className="space-y-4">
                                {report.highlights.map((h, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 bg-gray-900/40 rounded-2xl border border-white/5 transition-all hover:translate-x-2">
                                        <span className="material-icons-round text-emerald-500 text-sm mt-1">check_circle</span>
                                        <span className="text-sm text-gray-300 font-medium leading-relaxed">{h}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#1e1e20] rounded-[32px] p-8 border border-[#333] shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                                    <span className="material-icons-round">warning_amber</span>
                                </div>
                                <h3 className="font-bold text-lg text-white">Growth Areas</h3>
                            </div>
                            <ul className="space-y-4">
                                {report.weakPoints.map((w, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 bg-gray-900/40 rounded-2xl border border-white/5 transition-all hover:translate-x-2">
                                        <span className="material-icons-round text-amber-500 text-sm mt-1">priority_high</span>
                                        <span className="text-sm text-gray-300 font-medium leading-relaxed">{w}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>

                {/* Accent & Practice Section */}
                {report.accentCoaching && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1e1e20] rounded-[40px] p-10 border border-[#333] shadow-2xl relative overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                      
                      <div className="flex flex-col md:flex-row gap-12 relative z-10">
                          <div className="md:w-1/3 space-y-8">
                              <div>
                                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20 mb-6">
                                      <span className="material-icons-round text-sm text-purple-400">record_voice_over</span>
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Target Accent Mastery</span>
                                  </div>
                                  <h3 className="text-3xl font-black text-white mb-4 leading-tight">Authentic Phrasing</h3>
                                  <p className="text-gray-400 leading-relaxed mb-6">
                                      {report.accentCoaching.pronunciationFeedback}
                                  </p>

                                  {/* New: Slang & Fillers */}
                                  <div className="space-y-4">
                                      {report.accentCoaching.slangExamples && (
                                          <div className="bg-[#131314] rounded-3xl p-6 border border-[#333]">
                                              <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-3">Authentic Slang</span>
                                              <div className="flex flex-wrap gap-2">
                                                  {report.accentCoaching.slangExamples.map((s, i) => (
                                                      <span key={i} className="px-3 py-1 bg-purple-600/10 text-purple-400 rounded-lg text-xs font-bold border border-purple-500/20">
                                                          {s}
                                                      </span>
                                                  ))}
                                              </div>
                                          </div>
                                      )}
                                      
                                      {report.accentCoaching.vocabularyTips && (
                                          <div className="bg-[#131314] rounded-3xl p-6 border border-[#333]">
                                              <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-3">Lexical Choices</span>
                                              <div className="space-y-2">
                                                  {report.accentCoaching.vocabularyTips.map((tip, i) => (
                                                      <div key={i} className="flex gap-2 text-xs text-gray-400">
                                                          <span className="text-blue-400">→</span>
                                                          {tip}
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              </div>

                              <div className="bg-[#131314] rounded-3xl p-6 border border-[#333]">
                                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-4">Focus Sounds</span>
                                  <div className="flex flex-wrap gap-2">
                                      {report.accentCoaching.difficultSounds.map((sound, i) => (
                                          <div key={i} className="px-4 py-2 bg-[#1e1e20] border border-white/10 rounded-xl text-blue-400 font-mono font-bold text-sm shadow-inner italic">
                                              /{sound}/
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          <div className="flex-1 space-y-10">
                               <div>
                                  <h4 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">Native Rhythms</h4>
                                  <div className="p-8 bg-gray-900/60 rounded-[32px] border border-white/5 backdrop-blur-3xl">
                                      <p className="text-lg text-gray-200 leading-relaxed font-medium italic">
                                          "{report.accentCoaching.intonationTips}"
                                      </p>
                                  </div>
                               </div>

                               <div>
                                  <div className="flex items-center gap-2 mb-6">
                                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">Practice Drills</h4>
                                      <div className="h-px flex-1 bg-[#333]" />
                                  </div>
                                  <div className="grid md:grid-cols-2 gap-4">
                                      {report.accentCoaching.practicePhrases.map((phrase, i) => (
                                          <div key={i} className="group p-5 bg-[#131314] rounded-2xl border border-[#333] hover:border-blue-500/40 transition-all flex items-center justify-between cursor-pointer">
                                              <span className="text-sm text-gray-300 font-bold group-hover:text-blue-400 transition-colors">"{phrase}"</span>
                                              <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                  <span className="material-icons-round text-sm">play_arrow</span>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                               </div>
                          </div>
                      </div>
                  </motion.div>
                )}

                {/* Final Score Guard - Bottom CTA */}
                <div className="flex justify-center pt-8">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="group relative px-12 py-5 bg-white text-black rounded-[24px] font-black text-lg uppercase tracking-widest overflow-hidden shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                             Finish & Review History
                             <span className="material-icons-round transition-transform group-hover:translate-x-1">arrow_forward</span>
                        </span>
                        <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </motion.button>
                </div>

            </div>
        </div>

        {showShare && <ShareCard report={report} onClose={() => setShowShare(false)} />}
    </div>
  );
};

export default ReportCard;