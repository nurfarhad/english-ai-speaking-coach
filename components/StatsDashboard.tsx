import React from 'react';
import { motion } from 'motion/react';
import { UserStats, Achievement, DailyGoal, SavedWord } from '../types';

interface StatsDashboardProps {
    stats: UserStats;
    onClose?: () => void;
    dailyGoalMinutes?: number;
    savedWords?: SavedWord[];
}

const ProgressCircle = ({ progress, size = 120, strokeWidth = 8, color = "text-blue-500" }: { progress: number, size?: number, strokeWidth?: number, color?: string }) => {
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
                <span className="text-2xl font-black text-white">{Math.round(progress)}%</span>
            </div>
        </div>
    );
};

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className={`p-6 rounded-[32px] border transition-all ${achievement.unlockedAt ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/2 border-white/5 opacity-50'}`}>
        <div className="flex gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${achievement.unlockedAt ? 'bg-blue-600 text-white shadow-blue-600/20' : 'bg-gray-800 text-gray-500'}`}>
                <span className="material-icons-round">{achievement.icon}</span>
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-white mb-1">{achievement.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{achievement.description}</p>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${achievement.progress}%` }}
                        className={`h-full ${achievement.unlockedAt ? 'bg-blue-500' : 'bg-gray-700'}`}
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
                    <h5 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">{goal.title}</h5>
                    <p className="text-lg font-bold text-white">{goal.current} / {goal.target}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${progress >= 100 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {progress >= 100 ? 'COMPLETED' : `${Math.round(progress)}%`}
                </span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    className={`h-full transition-colors ${progress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                />
            </div>
        </div>
    );
};

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, onClose }) => {
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
                            <h2 className="text-xl font-black text-white">Your Progress</h2>
                            {onClose && (
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
                                    <span className="material-icons-round text-gray-500">close</span>
                                </button>
                            )}
                        </div>

                        <div className="relative group">
                            <ProgressCircle progress={(stats.xp % 1000) / 10} size={200} strokeWidth={12} color="text-blue-500" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-white">Lvl {stats.level}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-1">{stats.xp} XP</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full mt-4">
                            <div className="bg-[#131314] p-6 rounded-[32px] border border-white/5 text-center transition-transform hover:scale-105">
                                <span className="material-icons-round text-orange-500 mb-2">local_fire_department</span>
                                <p className="text-2xl font-black text-white">{stats.streak}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Day Streak</p>
                            </div>
                            <div className="bg-[#131314] p-6 rounded-[32px] border border-white/5 text-center transition-transform hover:scale-105">
                                <span className="material-icons-round text-blue-400 mb-2">auto_awesome</span>
                                <p className="text-2xl font-black text-white">{stats.vocabularyMastered}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Mastered</p>
                            </div>
                        </div>

                        <div className="w-full space-y-6 bg-[#131314] p-8 rounded-[40px] border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Daily Goals</h4>
                            {stats.dailyGoals.map(goal => (
                                <DailyGoalItem key={goal.id} goal={goal} />
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Achievements & Milestones */}
                    <div className="flex-1 p-10 flex flex-col overflow-y-auto custom-scrollbar">
                        <div className="hidden md:flex justify-between items-center mb-10">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tight">Milestones & Badges</h1>
                                <p className="text-sm text-gray-400">Keep practicing to unlock premium rewards.</p>
                            </div>
                            {onClose && (
                                <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all border border-white/5">
                                    <span className="material-icons-round">close</span>
                                </button>
                            )}
                        </div>

                        <div className="space-y-10">
                            {/* Milestone Section */}
                            <section>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-6">Pronunciation Milestones</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {stats.achievements.filter(a => a.isMilestone).map(achievement => (
                                        <AchievementCard key={achievement.id} achievement={achievement} />
                                    ))}
                                </div>
                            </section>

                            {/* Achievements Section */}
                            <section>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-purple-400 mb-6">Badges Earned</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
