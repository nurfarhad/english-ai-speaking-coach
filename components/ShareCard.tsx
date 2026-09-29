import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AnalysisReport } from '../types';

interface ShareCardProps {
    report: AnalysisReport;
    onClose: () => void;
}

const ShareCard: React.FC<ShareCardProps> = ({ report, onClose }) => {
    const [downloaded, setDownloaded] = useState(false);

    const handleDownload = () => {
        const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750" style="background:#131314; font-family:system-ui, -apple-system, sans-serif;">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e1e20"/>
                    <stop offset="100%" stop-color="#131314"/>
                </linearGradient>
            </defs>
            <rect width="600" height="750" rx="36" fill="url(#bg)" stroke="#333" stroke-width="2"/>
            <circle cx="300" cy="110" r="45" fill="#10b981"/>
            <text x="300" y="120" text-anchor="middle" font-size="32" font-weight="bold" fill="#131314">${report.score}</text>
            <text x="300" y="190" text-anchor="middle" font-size="14" font-weight="bold" fill="#10b981" letter-spacing="3">AI SPEAKING COACH REPORT</text>
            <text x="300" y="235" text-anchor="middle" font-size="28" font-weight="800" fill="#ffffff">English Fluency Achievement</text>
            
            <rect x="60" y="280" width="220" height="110" rx="20" fill="#1e1e20" stroke="#2a2a2c"/>
            <text x="85" y="320" font-size="12" fill="#888" font-weight="bold" letter-spacing="1">FLUENCY</text>
            <text x="85" y="365" font-size="34" fill="#10b981" font-weight="bold">${report.fluencyScore}%</text>
            
            <rect x="320" y="280" width="220" height="110" rx="20" fill="#1e1e20" stroke="#2a2a2c"/>
            <text x="345" y="320" font-size="12" fill="#888" font-weight="bold" letter-spacing="1">VOCABULARY</text>
            <text x="345" y="365" font-size="34" fill="#3b82f6" font-weight="bold">${report.vocabularyScore}%</text>

            <rect x="60" y="410" width="220" height="110" rx="20" fill="#1e1e20" stroke="#2a2a2c"/>
            <text x="85" y="450" font-size="12" fill="#888" font-weight="bold" letter-spacing="1">ACCENT MATCH</text>
            <text x="85" y="495" font-size="34" fill="#f59e0b" font-weight="bold">${report.accentMatchScore}%</text>
            
            <rect x="320" y="410" width="220" height="110" rx="20" fill="#1e1e20" stroke="#2a2a2c"/>
            <text x="345" y="450" font-size="12" fill="#888" font-weight="bold" letter-spacing="1">CONFIDENCE</text>
            <text x="345" y="495" font-size="34" fill="#ec4899" font-weight="bold">${report.confidenceScore}%</text>

            <rect x="60" y="545" width="480" height="85" rx="20" fill="#1e1e20" stroke="#2a2a2c"/>
            <text x="85" y="580" font-size="12" fill="#10b981" font-weight="bold" letter-spacing="1">SESSION SUMMARY</text>
            <text x="85" y="608" font-size="13" fill="#ccc">${report.summary.slice(0, 55)}...</text>

            <text x="300" y="695" text-anchor="middle" font-size="13" fill="#666" font-weight="bold" letter-spacing="2">FLUENT AI SPEAKING COACH</text>
        </svg>`;

        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `speaking-coach-achievement-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2500);
    };

    return (
        <div className="fixed inset-0 bg-[#000]/90 backdrop-blur-3xl z-[200] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm bg-gradient-to-br from-[#1e1e20] to-[#131314] rounded-[40px] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden relative"
            >
                {/* Background Accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative p-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
                        <span className="material-icons-round text-3xl text-white">record_voice_over</span>
                    </div>
                    
                    <h3 className="text-xs font-semibold text-blue-400 mb-2">weekly progress</h3>
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-8">english virtuoso</h2>
                    
                    <div className="w-full grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                            <div className="text-[11px] font-semibold text-gray-500 mb-1">fluency</div>
                            <div className="text-2xl font-bold text-white">{report.fluencyScore}%</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                            <div className="text-[11px] font-semibold text-gray-500 mb-1">vocab</div>
                            <div className="text-2xl font-bold text-white">{report.vocabularyScore}%</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                            <div className="text-[11px] font-semibold text-gray-500 mb-1">accent</div>
                            <div className="text-2xl font-bold text-white">{report.accentMatchScore}%</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                            <div className="text-[11px] font-semibold text-gray-500 mb-1">confidence</div>
                            <div className="text-2xl font-bold text-white">{report.confidenceScore}%</div>
                        </div>
                    </div>

                    {report.styleScore && (
                        <div className="w-full bg-blue-600/10 rounded-2xl p-4 border border-blue-500/20 mb-8">
                            <div className="text-[11px] font-semibold text-blue-400 mb-1">style mastered</div>
                            <div className="text-lg font-bold text-white mb-1">✨ {report.styleScore.styleName.toLowerCase()}</div>
                            <div className="text-[10px] text-gray-400 font-medium">"{report.styleScore.feedback.slice(0, 40)}..."</div>
                        </div>
                    )}

                    <div className="space-y-4 w-full">
                        <button 
                            onClick={handleDownload}
                            className="w-full py-4 bg-white text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-[0.98]"
                        >
                             {downloaded ? 'card downloaded!' : 'download card'}
                             <span className="material-icons-round text-sm">{downloaded ? 'check' : 'download'}</span>
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 bg-transparent text-gray-500 hover:text-white rounded-2xl font-bold text-xs transition-all"
                        >
                            back to report
                        </button>
                    </div>

                    <div className="mt-10 flex items-center gap-2 opacity-30">
                        <span className="material-icons-round text-sm">auto_awesome</span>
                        <span className="text-[11px] font-semibold tracking-wide italic">fluent ai tutor</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ShareCard;
