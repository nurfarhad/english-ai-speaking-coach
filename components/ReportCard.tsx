import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, X, RefreshCw, Sparkles, Brain, Trophy, AlertTriangle, CheckCircle2, Play, ChevronRight, BarChart2, Zap, Headphones, Waves } from 'lucide-react';
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
  onRetry?: () => void;
}

const iconMap = {
   'sparkles': <Sparkles size={20} />,
   'zap': <Zap size={20} />,
   'clipboard-list': <Brain size={20} />,
   'headphones': <Headphones size={20} />,
   'bar-chart-2': <BarChart2 size={20} />
};

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
  icon: keyof typeof iconMap, 
  description: string,
  suffix?: string,
  delay?: number 
}) => {
  const coachingLabel = value >= 90 ? "Master" : value >= 80 ? "Adept" : value >= 70 ? "Stable" : "Training";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#1e1e20] rounded-[32px] p-6 border border-white/10 shadow-xl hover:border-emerald-500/20 transition-all group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${color.replace('text', 'bg').replace('-400', '-500/10').replace('-500', '-500/10').replace('-300', '-500/10')} text-current`}>
          <div className={color}>{iconMap[icon]}</div>
        </div>
        <div>
          <span className={`text-[10px] font-semibold ${color}`}>{coachingLabel}</span>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
            <span className="text-[11px] font-medium text-gray-400">{suffix}</span>
          </div>
        </div>
      </div>
      <h3 className="font-semibold text-white text-xs mb-1 uppercase tracking-widest">{label}</h3>
      <p className="text-[11px] text-gray-400 font-medium leading-relaxed">{description}</p>
      
      {/* Mini Progress Bar */}
      <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
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

const HeatmapItem: React.FC<{ value: number; turnNumber?: number }> = ({ value, turnNumber }) => {
  const opacity = Math.max(0.25, Math.min(1, value / 100));
  return (
    <div 
      className="aspect-square rounded-md border border-white/10 transition-transform hover:scale-110 cursor-help flex items-center justify-center text-[10px] font-bold text-white/90"
      style={{ backgroundColor: `rgba(16, 185, 129, ${opacity})` }}
      title={turnNumber ? `Turn ${turnNumber}: ${value}% accuracy` : `Pronunciation Accuracy: ${value}%`}
    >
      {turnNumber}
    </div>
  );
};

const ReportCard: React.FC<ReportCardProps> = ({ report, onClose, onRetry }) => {
  const [showShare, setShowShare] = useState(false);
  const chartData = report.performanceData.map((val, i) => ({
    name: `Turn ${i + 1}`,
    value: val
  }));

  return (
    <div className="w-full h-full bg-[#131314] flex flex-col animate-fade-in overflow-hidden">
        
        {/* Modern Navbar */}
        <div className="flex items-center justify-between p-6 bg-[#1a1a1c] shrink-0 z-20 shadow-2xl border-b border-white/10">
            <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl ${report.isError ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-bold text-[#131314]">{report.isError ? '!' : report.score}</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight uppercase tracking-widest">
                      {report.isError ? 'Evaluation Interrupted' : 'AI Performance'}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] font-bold ${report.isError ? 'text-rose-400' : 'text-emerald-400'} uppercase tracking-widest`}>
                          {report.isError ? 'Action Required' : 'Analysis Session'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                        <span className="text-[11px] font-medium text-gray-400">
                          {report.isError ? 'Network/Service error occurred' : report.score >= 80 ? 'Confident fluency detected' : 'Great progress today'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {onRetry && report.isError && (
                  <button 
                    onClick={onRetry}
                    aria-label="Retry speech analysis"
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#131314] rounded-2xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 group"
                  >
                      <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                      Retry Analysis
                  </button>
                )}
                {!report.isError && (
                  <button 
                    onClick={() => setShowShare(true)}
                    aria-label="Share performance report"
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-xl shadow-orange-600/20 group"
                  >
                      <Share2 size={14} className="group-hover:scale-110 transition-transform" />
                      Share
                  </button>
                )}
                <button 
                    onClick={onClose}
                    aria-label="Return to scenarios"
                    className="px-6 py-3 bg-[#2a2a2c] hover:bg-[#333] text-white rounded-2xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest border border-white/10"
                >
                    <X size={14} />
                    Scenarios
                </button>
            </div>
        </div>

        {/* Dashboard Frame */}
        <div className="flex-1 overflow-y-auto bg-[#131314] p-8">
            <div className="max-w-7xl mx-auto space-y-8 pb-20">
                {/* Error Banner if report failed */}
                {report.isError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-500/10 border-2 border-rose-500/30 rounded-[32px] p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-rose-200 uppercase tracking-wider">AI Report Generation Failed</h3>
                        <p className="text-sm text-gray-300 mt-1">{report.errorMessage || "Unable to reach Gemini API. Your conversation transcript was preserved."}</p>
                      </div>
                    </div>
                    {onRetry && (
                      <button 
                        onClick={onRetry}
                        className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2 shrink-0 shadow-xl shadow-rose-600/20"
                      >
                        <RefreshCw size={14} />
                        Retry Analysis
                      </button>
                    )}
                  </motion.div>
                )}
                
                {/* Visual Overview: Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Speak Like Style Highlight */}
                    {report.styleScore && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="lg:col-span-12 bg-gradient-to-r from-emerald-500/10 via-orange-500/10 to-emerald-500/10 rounded-[40px] p-1 border-2 border-emerald-500/20 shadow-2xl overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                            <div className="relative bg-[#1a1a1c]/90 backdrop-blur-xl rounded-[38px] p-10 flex flex-col md:flex-row items-center gap-10">
                                <div className="shrink-0 relative">
                                    <div className="w-28 h-28 rounded-full bg-emerald-500 flex items-center justify-center text-5xl shadow-[0_0_60px_rgba(16,185,129,0.3)] border-[8px] border-[#1a1a1c]">
                                        {report.styleScore.score > 80 ? '🌟' : '🎯'}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-[#1a1a1c] text-lg shadow-xl">
                                        {report.styleScore.score}
                                    </div>
                                </div>
                                
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                                        <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Persona Profile</h3>
                                        <div className="h-px w-16 bg-emerald-500/30" />
                                        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">{report.styleScore.styleName}</span>
                                    </div>
                                    <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
                                        Vocal Match: {report.styleScore.styleName}
                                    </h2>
                                    <p className="text-gray-400 max-w-2xl text-[15px] leading-relaxed">
                                        {report.styleScore.feedback}
                                    </p>
                                </div>

                                <div className="shrink-0 flex gap-5">
                                    <div className="text-center px-8 py-6 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                                        <div className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Rhythm</div>
                                        <div className="text-3xl font-bold text-emerald-400 leading-none">94%</div>
                                    </div>
                                    <div className="text-center px-8 py-6 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                                        <div className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Tone</div>
                                        <div className="text-3xl font-bold text-orange-400 leading-none">Expert</div>
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
                                <h3 className="text-lg font-bold text-white uppercase tracking-widest">Conversation Performance</h3>
                                <p className="text-sm text-gray-400">Measured turn-by-turn AI evaluation score</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Turn Accuracy</span>
                                </div>
                            </div>
                         </div>
                         
                         <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2a2a2c" />
                                    <XAxis dataKey="name" stroke="#777" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: '#1a1a1c', border: '1px solid #444', borderRadius: '16px' }}
                                      itemStyle={{ fontSize: '12px', fontWeight: '700', color: '#10b981' }}
                                    />
                                    <Area type="monotone" dataKey="value" name="Turn Score" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
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
                         <div className="bg-[#1e1e20] rounded-[32px] p-8 border border-[#333] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[50px] group-hover:bg-emerald-500/10 transition-colors"></div>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-white tracking-tight uppercase tracking-widest text-xs">Turn Consistency</h3>
                                    <p className="text-[11px] text-gray-400 mt-0.5">Real AI scores per turn</p>
                                </div>
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                                    <BarChart2 size={16} />
                                </div>
                            </div>
                            {report.performanceData.length > 0 ? (
                                <div className="grid grid-cols-6 gap-2">
                                    {report.performanceData.map((val, i) => (
                                        <HeatmapItem key={i} value={val} turnNumber={i + 1} />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-gray-400">
                                    Single-turn session evaluated
                                </div>
                            )}
                            <p className="mt-6 text-[11px] font-bold tracking-wider text-gray-300 leading-relaxed uppercase">
                              {report.performanceData.length > 0 
                                ? `${report.performanceData.length} Evaluated Turns Recorded` 
                                : `Overall Accuracy: ${report.score}%`}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-[#060706] to-[#1a1a1c] rounded-[40px] p-10 text-white shadow-2xl border border-white/10 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform text-orange-500">
                                <RefreshCw size={50} />
                             </div>
                             <h3 className="font-bold text-xs text-orange-400 mb-3 uppercase tracking-widest">Pacing Index</h3>
                             <div className="text-4xl font-bold mb-2 tracking-tight uppercase">
                                {report.pacingScore >= 80 ? 'Optimal' : report.pacingScore >= 60 ? 'Steady' : 'Developing'}
                             </div>
                             <p className="text-xs text-gray-300 font-medium leading-relaxed">
                                {report.pacingScore >= 80 ? 'Natural conversational cadence maintained.' : 'Practice pausing naturally between sentences.'}
                             </p>
                             <div className="mt-8 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Cadence</span>
                                    <span className="font-bold text-lg text-emerald-400">130–150 WPM</span>
                                </div>
                                <div className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-bold text-xl text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
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
                      icon="sparkles" 
                      description="Advanced word choices"
                    />
                    <MetricCard 
                      label="Confidence" 
                      value={report.confidenceScore} 
                      color="text-emerald-300" 
                      icon="zap" 
                      description="Assertiveness in speech"
                    />
                    <MetricCard 
                      label="Grammar" 
                      value={report.grammarConsistency} 
                      color="text-orange-500" 
                      icon="clipboard-list" 
                      description="Syntactical accuracy"
                    />
                    <MetricCard 
                      label="Style Match" 
                      value={report.accentMatchScore} 
                      color="text-orange-400" 
                      icon="headphones" 
                      description="Target persona alignment"
                    />
                    <div className="bg-[#1e1e20] rounded-3xl p-6 border border-[#333] flex flex-col justify-center items-center group">
                        <div className="mb-2 p-3 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                            <span className="material-icons-round text-red-400">error_outline</span>
                        </div>
                        <span className="text-[10px] font-bold text-red-400 mb-1 uppercase tracking-widest">Filler Words</span>
                        <div className="text-4xl font-bold text-white">{report.fillerWordsDetected}</div>
                        <p className="text-[11px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Minimal Hesitation</p>
                    </div>
                </div>

                {/* Detailed Analysis Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Tutor Feedback Card */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#1e1e20] rounded-[32px] p-8 border border-[#333] shadow-xl relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-emerald-500/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <Brain size={20} />
                            </div>
                            <h3 className="font-bold text-xs text-white uppercase tracking-widest">Ai Neural Insights</h3>
                        </div>
                        <p className="text-gray-300 leading-relaxed italic text-[15px] font-medium">
                            "{report.summary}"
                        </p>
                        
                        <div className="mt-8 space-y-6">
                            <div>
                                <span className="text-[9px] font-bold text-gray-600 mb-4 block uppercase tracking-widest">Strategic Focus Points</span>
                                <div className="space-y-3">
                                    {report.suggestions.map((tip, i) => (
                                        <div key={i} className="flex gap-4 items-start group/tip">
                                            <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                                <span className="text-[10px] font-black">{i+1}</span>
                                            </div>
                                            <p className="text-[13px] text-gray-500 group-hover/tip:text-gray-300 transition-colors leading-[1.6] font-medium">{tip}</p>
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
                                    <Trophy size={18} />
                                </div>
                                <h3 className="font-bold text-xs text-white uppercase tracking-widest">Top Achievements</h3>
                            </div>
                            <ul className="space-y-4">
                                {report.highlights.map((h, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 bg-gray-900/40 rounded-2xl border border-white/5 transition-all hover:translate-x-2">
                                        <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <span className="text-[13px] text-gray-400 font-medium leading-relaxed">{h}</span>
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
                                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                                    <AlertTriangle size={18} />
                                </div>
                                <h3 className="font-bold text-xs text-white uppercase tracking-widest">Target Refinement</h3>
                            </div>
                            <ul className="space-y-4">
                                {report.weakPoints.map((w, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 bg-gray-900/40 rounded-2xl border border-white/5 transition-all hover:translate-x-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                                        <span className="text-[13px] text-gray-400 font-medium leading-relaxed">{w}</span>
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
                    className="bg-[#1e1e20] rounded-[48px] p-12 border border-[#333] shadow-2xl relative overflow-hidden"
                  >
                      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                      
                      <div className="flex flex-col md:flex-row gap-16 relative z-10">
                          <div className="md:w-1/3 space-y-10">
                              <div>
                                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20 mb-8">
                                      <Headphones size={12} className="text-orange-400" />
                                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Target Persona Sync</span>
                                  </div>
                                  <h3 className="text-3xl font-bold text-white mb-5 leading-tight tracking-tight uppercase">Vocal Delivery</h3>
                                  <p className="text-sm text-gray-400 font-medium leading-relaxed mb-10">
                                      {report.accentCoaching.pronunciationFeedback}
                                  </p>

                                  {/* new: slang & fillers */}
                                  <div className="space-y-6">
                                      {report.accentCoaching.slangExamples && (
                                          <div className="bg-[#0b0c0b] rounded-[32px] p-8 border border-white/5">
                                              <span className="text-[10px] font-bold text-gray-500 block mb-4 uppercase tracking-widest">Colloquial Logic</span>
                                              <div className="flex flex-wrap gap-3">
                                                  {report.accentCoaching.slangExamples.map((s, i) => (
                                                      <span key={i} className="px-4 py-2 bg-orange-500/10 text-orange-400 rounded-xl text-[10px] font-bold uppercase border border-orange-500/20">
                                                          {s}
                                                      </span>
                                                  ))}
                                              </div>
                                          </div>
                                      )}
                                      
                                      {report.accentCoaching.vocabularyTips && (
                                          <div className="bg-[#0b0c0b] rounded-[32px] p-8 border border-white/5">
                                              <span className="text-[10px] font-bold text-gray-500 block mb-4 uppercase tracking-widest">Lexical Nuance</span>
                                              <div className="space-y-3">
                                                  {report.accentCoaching.vocabularyTips.map((tip, i) => (
                                                      <div key={i} className="flex gap-3 text-xs text-gray-400 font-medium leading-relaxed">
                                                          <span className="text-emerald-500">/</span>
                                                          {tip}
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              </div>

                              <div className="bg-[#0b0c0b] rounded-[32px] p-8 border border-white/5 shadow-inner">
                                  <span className="text-[10px] font-bold text-gray-500 block mb-5 uppercase tracking-widest">Phonetic Focus</span>
                                  <div className="flex flex-wrap gap-3">
                                      {report.accentCoaching.difficultSounds.map((sound, i) => (
                                          <div key={i} className="px-5 py-3 bg-[#1a1a1c] border border-white/5 rounded-2xl text-emerald-400 font-mono font-semibold text-sm shadow-xl">
                                              /{sound}/
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          <div className="flex-1 space-y-12">
                               <div>
                                  <h4 className="text-[11px] font-semibold text-gray-400 mb-6 tracking-wider text-center md:text-left uppercase">Native Tonal Rhythms</h4>
                                  <div className="p-10 bg-[#0b0c0b] rounded-[40px] border border-white/5 relative group">
                                      <div className="absolute top-0 right-0 p-6 text-emerald-500/20">
                                          <Waves size={40} />
                                      </div>
                                      <p className="text-2xl text-gray-300 font-semibold tracking-tight leading-relaxed italic">
                                          "{report.accentCoaching.intonationTips}"
                                      </p>
                                  </div>
                               </div>

                               <div>
                                  <div className="flex items-center gap-4 mb-8">
                                      <h4 className="text-[11px] font-semibold text-gray-400 tracking-wider whitespace-nowrap uppercase">Drill Scenarios</h4>
                                      <div className="h-px flex-1 bg-white/5" />
                                  </div>
                                  <div className="grid md:grid-cols-2 gap-6">
                                      {report.accentCoaching.practicePhrases.map((phrase, i) => (
                                          <div key={i} className="group p-6 bg-[#0b0c0b] rounded-[32px] border border-white/5 hover:border-emerald-500/40 transition-all flex items-center justify-between cursor-pointer shadow-lg hover:shadow-emerald-500/5">
                                              <span className="text-sm text-gray-400 font-semibold group-hover:text-emerald-400 transition-colors">"{phrase}"</span>
                                              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-[#060706] transition-all shadow-xl">
                                                  <Play size={16} fill="currentColor" />
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
                <div className="flex justify-center pt-12">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="group relative px-16 py-6 bg-white text-black rounded-[32px] font-bold text-xs uppercase tracking-widest overflow-hidden shadow-[0_30px_60px_rgba(255,255,255,0.1)]"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                             Finalize Session
                             <ChevronRight size={16} className="transition-transform group-hover:translate-x-2" />
                        </span>
                        <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </motion.button>
                </div>

            </div>
        </div>

        {showShare && <ShareCard report={report} onClose={() => setShowShare(false)} />}
    </div>
  );
};

export default ReportCard;