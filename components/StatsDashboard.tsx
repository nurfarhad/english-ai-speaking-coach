import React from 'react';
import { motion } from 'motion/react';
import { UserStats, Achievement, DailyGoal, SavedWord } from '../types';
import { X, Flame, Sparkles, Trophy, Star, Target, Zap, Waves, Headphones, Mic2 } from 'lucide-react';

interface StatsDashboardProps {
    stats: UserStats;
    onClose?: () => void;
    dailyGoalMinutes?: number;
    savedWords?: SavedWord[];
}

const iconMap: Record<string, React.ReactNode> = {
    'local_fire_department': <Flame size={24} />,
    'auto_awesome': <Sparkles size={24} />,
    'emoji_events': <Trophy size={24} />,
    'stars': <Star size={24} />,
    'track_changes': <Target size={24} />,
    'electric_bolt': <Zap size={24} />,
    'waves': <Waves size={24} />,
};

const ProgressCircle = ({ progress, size = 120, strokeWidth = 8, color = "text-emerald-500" }: { progress: number, size?: number, strokeWidth?: number, color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-white/5"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <motion.circle
                    className={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-extrabold text-white font-display">{Math.round(progress)}%</span>
            </div>
        </div>
    );
};

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className={`p-6 rounded-[32px] border transition-all ${achievement.unlockedAt ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/2 border-white/5 opacity-50'}`}>
        <div className="flex gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${achievement.unlockedAt ? 'bg-emerald-500 text-[#060706] shadow-emerald-600/20' : 'bg-gray-800 text-gray-500'}`}>
                {iconMap[achievement.icon] || <Trophy size={24} />}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-white mb-1 tracking-tight text-sm">{achievement.title}</h4>
                <p className="text-[11px] text-gray-400 font-medium tracking-wide leading-relaxed mb-3">{achievement.description}</p>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${achievement.progress}%` }}
                        className={`h-full ${achievement.unlockedAt ? 'bg-emerald-500' : 'bg-gray-700'}`}
                    />
                </div>
            </div>
        </div>
    </div>
);

const DailyGoalItem: React.FC<{ goal: DailyGoal }> = ({ goal }) => {
    const progress = (goal.current / goal.target) * 100;
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <div>
                    <h5 className="text-[10px] font-semibold text-gray-400 mb-1">{goal.title}</h5>
                    <p className="text-xl font-bold text-white leading-none">{goal.current} / {goal.target}</p>
                </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md tracking-widest uppercase ${progress >= 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {progress >= 100 ? 'Success' : `${Math.round(progress)}%`}
                    </span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    className={`h-full transition-colors ${progress >= 100 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                />
            </div>
        </div>
    );
};

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, onClose, dailyGoalMinutes, savedWords }) => {
    const vocabCount = savedWords !== undefined ? savedWords.length : stats.vocabularyMastered;
    const goals = stats.dailyGoals.map(g => {
        if (g.type === 'speaking_minutes' && dailyGoalMinutes) {
            return { ...g, target: dailyGoalMinutes };
        }
        if (g.type === 'vocabulary' && savedWords !== undefined) {
            return { ...g, current: Math.max(g.current, savedWords.length) };
        }
        return g;
    });

    return (
        <div className={onClose ? "fixed inset-0 bg-[#131314]/98 backdrop-blur-2xl z-[150] flex items-center justify-center p-6 overflow-y-auto" : "w-full overflow-hidden"}>
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={onClose ? "w-full max-w-5xl bg-[#1e1e20] rounded-[48px] border border-white/10 shadow-2xl overflow-hidden" : "w-full bg-[#1e1e20] rounded-[48px] border border-white/10 shadow-2xl overflow-hidden mt-4"}
            >
                <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                    {/* Sidebar: Progress Summary */}
                    <div className="md:w-1/3 p-10 bg-white/2 border-r border-white/5 flex flex-col items-center gap-8">
                        <div className="w-full flex justify-between items-center md:hidden">
                            <h2 className="text-xl font-bold text-white tracking-tight uppercase tracking-widest">My Activity</h2>
                            {onClose && (
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <div className="relative group">
                            <ProgressCircle progress={(stats.xp % 1000) / 10} size={220} strokeWidth={12} color="text-emerald-500" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-extrabold text-white tracking-tighter font-display uppercase">LVL {stats.level}</span>
                                <div className="px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 mt-4 backdrop-blur-sm">
                                    <span className="text-[11px] font-extrabold text-emerald-400 tracking-wider uppercase">{stats.xp} XP</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full mt-4">
                            <div className="bg-[#131314] p-6 rounded-[32px] border border-white/5 text-center transition-transform hover:scale-105 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Flame size={24} className="text-orange-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-white leading-none">{stats.streak}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest leading-none">Daily Streak</p>
                            </div>
                            <div className="bg-[#131314] p-6 rounded-[32px] border border-white/5 text-center transition-transform hover:scale-105 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Sparkles size={24} className="text-emerald-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-white leading-none">{vocabCount}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest leading-none">Words Mastered</p>
                            </div>
                        </div>

                        <div className="w-full space-y-7 bg-[#131314] p-8 rounded-[40px] border border-white/10">
                            <h4 className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Performance Goals</h4>
                            {goals.map(goal => (
                                <DailyGoalItem key={goal.id} goal={goal} />
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Achievements & Milestones */}
                    <div className="flex-1 p-12 flex flex-col overflow-y-auto custom-scrollbar bg-[#1a1a1c]/50">
                        <div className="hidden md:flex justify-between items-center mb-12">
                            <div>
                                <h1 className="text-4xl font-bold text-white tracking-tighter mb-1 uppercase tracking-widest">Vault of Rewards</h1>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Unlock your legendary accent potential.</p>
                            </div>
                            {onClose && (
                                <button onClick={onClose} className="p-4 bg-white/2 hover:bg-white/5 rounded-full text-gray-600 hover:text-white transition-all border border-white/5">
                                    <X size={24} />
                                </button>
                            )}
                        </div>

                        <div className="space-y-12">
                            {/* Milestone Section */}
                            <section>
                                <h3 className="text-xs font-bold text-emerald-400 mb-8 flex items-center gap-4 uppercase tracking-widest">
                                    Milestones Achieved
                                    <div className="h-px flex-1 bg-emerald-500/10" />
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {stats.achievements.filter(a => a.isMilestone).map(achievement => (
                                        <AchievementCard key={achievement.id} achievement={achievement} />
                                    ))}
                                </div>
                            </section>

                            {/* Achievements Section */}
                            <section>
                                <h3 className="text-xs font-bold text-orange-400 mb-8 flex items-center gap-4 uppercase tracking-widest">
                                    Vocal Badges
                                    <div className="h-px flex-1 bg-orange-500/10" />
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {stats.achievements.filter(a => !a.isMilestone).map(achievement => (
                                        <AchievementCard key={achievement.id} achievement={achievement} />
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StatsDashboard;
