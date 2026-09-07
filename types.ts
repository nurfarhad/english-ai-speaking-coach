export interface PracticeLanguage {
    id: string;
    label: string;
    flag: string;
    instruction: string;
}

export enum CallState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  ERROR = 'ERROR'
}

export interface AudioVisualizerProps {
  isActive: boolean;
  volume: number; // 0 to 1
  isUserSpeaking: boolean;
}

export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
  Aoede = 'Aoede',
  Erebus = 'Erebus',
}

export type Personality = 'friendly' | 'energetic' | 'professional' | 'impatient' | 'humorous' | 'interviewer' | 'customer_support' | 'networking_coach';

export interface VoiceConfig {
    name: VoiceName;
    label: string;
    gender: 'male' | 'female';
    description: string;
    personality?: Personality;
}

export interface Scenario {
  id: string;
  title: string;
  emoji: string;
  systemInstruction: string;
  iceBreakers: string[];
  personality?: Personality;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  emotionalTone: string;
  vocabularyFocus: string[];
  practicePhrases?: string[];
}

export interface TranscriptItem {
    id: string;
    speaker: 'user' | 'model';
    text: string;
    timestamp: Date;
    audioUrl?: string; // For replay
    isStreaming?: boolean;
    vocabulary?: Array<{
        word: string;
        definition: string;
        examples?: string[];
    }>;
    corrections?: Array<{
        original: string;
        corrected: string;
        explanation: string;
    }>;
}

export interface AccentCoaching {
    pronunciationFeedback: string;
    intonationTips: string;
    difficultSounds: string[];
    practicePhrases: string[];
    vocabularyTips?: string[];
    slangExamples?: string[];
    conversationalRhythm?: string;
    fillerWords?: string;
}

export interface ProsodyMetrics {
    stress: number;      // 0-100 score
    rhythm: number;      // 0-100 score
    pitchRange: number;  // 0-100 score
    pacing: number;      // 0-100 score
}

export interface MimicAttempt {
    id: string;
    phrase: string;
    transcription?: string;
    userAudioUrl?: string;
    nativeAudioUrl?: string;
    prosodyScore: number;
    metrics?: ProsodyMetrics;
    coachingTip?: string;
    phonemeFeedback: Array<{
        phoneme: string;
        score: number; // 0-100
        suggestion?: string;
    }>;
    timestamp: Date;
}

export interface AnalysisReport {
    isError?: boolean;
    errorMessage?: string;
    score: number;
    fluencyScore: number;
    vocabularyScore: number;
    grammarScore: number;
    accentMatchScore: number;
    styleScore?: {
        score: number;
        feedback: string;
        styleName: string;
    };
    vocabularyRichness: number;
    confidenceScore: number;
    grammarConsistency: number;
    pacingScore: number;
    fillerWordsDetected: number;
    summary: string;
    highlights: string[];
    weakPoints: string[];
    suggestions: string[];
    performanceData: number[]; // For the timeline graph
    corrections: Array<{
        original: string;
        correction: string;
        alternative: string;
        explanation: string;
    }>;
    accentCoaching?: AccentCoaching;
    // New fields for memory update
    persistentObservations?: {
        grammarMistakes: string[];
        pronunciationWeakness: string[];
        avoidedStructures: string[];
        progressNote: string;
    };
}

export interface RealTimeMetrics {
    pronunciationConfidence: number;
    speakingSpeed: number; // Words per minute
    fluency: number;
    pauseTiming: number;
    fillerWords: string[];
    currentFeedback?: string;
    prosody?: ProsodyMetrics;
}

export interface UserStats {
    xp: number;
    level: number;
    streak: number;
    lastActiveDate: string;
    totalSpeakingMinutes: number;
    vocabularyMastered: number;
    achievements: Achievement[];
    dailyGoals: DailyGoal[];
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt?: string;
    progress: number; // 0-100
    isMilestone?: boolean;
}

export interface DailyGoal {
    id: string;
    title: string;
    target: number;
    current: number;
    type: 'speaking_minutes' | 'vocabulary' | 'xp' | 'mimic_attempts';
}

export interface SavedWord {
    word: string;
    translation?: string;
    timestamp: Date;
}

export interface SpeakLikeStyle {
    id: string;
    label: string;
    emoji: string;
    description: string;
    instruction: string;
    targetTraits: string[];
    typicalVocabulary: string[];
}

export interface UserMemory {
    repeatedGrammarMistakes: string[];
    pronunciationWeaknesses: string[];
    savedVocabulary: string[];
    speakingConfidence: number; // 0-100
    favoriteTopics: string[];
    avoidedSentenceStructures: string[];
    conversationHistorySummary: string[];
    coachNotes: string;
    lastUpdated: string;
}
