import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { Languages, User, Compass, Zap, Headphones, MessageSquare, BarChart2, Award, ClipboardList, Settings2, Globe, Shield, Mic2, Sparkles, BookOpen, ChevronRight, Check, AlertCircle, X } from 'lucide-react';
import { PracticeLanguage, CallState, VoiceName, Scenario, VoiceConfig, TranscriptItem, AnalysisReport, SavedWord, RealTimeMetrics, UserStats, UserMemory, SpeakLikeStyle } from './types';
import { LiveClient } from './services/liveClient';
import { generateAnalysisReport, analyzeMimicAttempt, updateUserMemory } from './services/reportService';
import Visualizer from './components/Visualizer';
import Transcript from './components/Transcript';
import ReportCard from './components/ReportCard';
import LiveCoach from './components/LiveCoach';
import MimicTrainer from './components/MimicTrainer';
import StatsDashboard from './components/StatsDashboard';
import CoachMemory from './components/CoachMemory';
import SpeakLikeSelector from './components/SpeakLikeSelector';
import FluencyMeter from './components/FluencyMeter';
import CallControls from './components/CallControls';
import { SCENARIOS, VOICES, ACCENTS, API_KEY_ERROR, DEFAULT_ACHIEVEMENTS, DEFAULT_GOALS, PERSONALITIES, SPEAK_LIKE_STYLES, PRACTICE_LANGUAGES } from './constants';

const API_KEY = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY || '' : '');
const DAILY_GOAL_MINUTES = 15;

const App: React.FC = () => {
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceConfig>(VOICES[0]); 
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]); 
  const [selectedStyle, setSelectedStyle] = useState<SpeakLikeStyle | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<PracticeLanguage>(PRACTICE_LANGUAGES[0]);
  const [setupTab, setSetupTab] = useState<'language' | 'coach' | 'scenario'>('language');
  
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0); // Current call duration in seconds
  const [dailySeconds, setDailySeconds] = useState<number>(() => {
    const saved = localStorage.getItem('daily_speaking_seconds');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  useEffect(() => {
    localStorage.setItem('daily_speaking_seconds', dailySeconds.toString());
  }, [dailySeconds]);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [showTranscript, setShowTranscript] = useState(true);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  const [mimicPhrase, setMimicPhrase] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'stats' | 'coach' | 'pronunciation'>('scenarios');
  
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('user_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse user stats", e);
      }
    }
    return {
      xp: 0,
      level: 1,
      streak: 1,
      lastActiveDate: new Date().toISOString(),
      totalSpeakingMinutes: 0,
      vocabularyMastered: 0,
      achievements: DEFAULT_ACHIEVEMENTS,
      dailyGoals: DEFAULT_GOALS
    };
  });

  useEffect(() => {
    localStorage.setItem('user_stats', JSON.stringify(userStats));
  }, [userStats]);

  const [savedWords, setSavedWords] = useState<SavedWord[]>(() => {
    const saved = localStorage.getItem('saved_vocabulary');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      } catch (e) {
        console.error("Failed to parse saved vocabulary", e);
      }
    }
    return [];
  });
  
  useEffect(() => {
    localStorage.setItem('saved_vocabulary', JSON.stringify(savedWords));
  }, [savedWords]);

  const [userMemory, setUserMemory] = useState<UserMemory>(() => {
    const saved = localStorage.getItem('user_memory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse memory", e);
      }
    }
    return {
        repeatedGrammarMistakes: [],
        pronunciationWeaknesses: [],
        savedVocabulary: [],
        speakingConfidence: 50,
        favoriteTopics: [],
        avoidedSentenceStructures: [],
        conversationHistorySummary: [],
        coachNotes: "Welcome! I'm your Polyglot AI tutor. I'll be tracking your progress to personalize each session.",
        lastUpdated: new Date().toISOString()
    };
  });

  useEffect(() => {
    localStorage.setItem('user_memory', JSON.stringify(userMemory));
  }, [userMemory]);

  const saveWord = (word: string) => {
    const cleanWord = word.trim().replace(/[.,!?;:]/g, "");
    if (!cleanWord) return;
    
    setSavedWords(prev => {
        if (prev.some(w => w.word.toLowerCase() === cleanWord.toLowerCase())) return prev;
        const newWords = [{ word: cleanWord, timestamp: new Date() }, ...prev];
        return newWords;
    });

    // Also update user memory for consistency with the AI
    setUserMemory(prev => ({
        ...prev,
        savedVocabulary: Array.from(new Set([...prev.savedVocabulary, cleanWord]))
    }));
  };

  const explainPhrase = async (phrase: string) => {
    setMetrics(prev => ({
        ...prev,
        currentFeedback: `Explaining "${phrase}"...`
    }));
    
    try {
      if (!API_KEY) {
        setMetrics(prev => ({
          ...prev,
          currentFeedback: `${phrase}: Useful phrasing for this scenario.`
        }));
        return;
      }
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Explain the phrase or term "${phrase}" in the context of learning ${selectedLanguage.label}. Keep it to 1 concise definition sentence followed by 1 realistic usage example.`
      });
      const explanation = res.text?.trim() || `${phrase}: Conversational phrase.`;
      setMetrics(prev => ({
        ...prev,
        currentFeedback: `${phrase}: ${explanation}`
      }));
    } catch (e) {
      setMetrics(prev => ({
        ...prev,
        currentFeedback: `${phrase}: Key phrasing to improve conversational fluency.`
      }));
    }
  };

  const correctSentence = async (item: TranscriptItem) => {
     try {
       if (!API_KEY) return;
       const ai = new GoogleGenAI({ apiKey: API_KEY });
       const prompt = `You are an expert ${selectedLanguage.label} coach. Analyze this sentence spoken by the student: "${item.text}". 
Return ONLY JSON with this structure:
{
  "original": "${item.text.replace(/"/g, '\\"')}",
  "corrected": "better phrased natural sentence",
  "explanation": "brief 1 sentence explanation of grammar or vocabulary improvement"
}`;
       const res = await ai.models.generateContent({
         model: 'gemini-2.0-flash',
         contents: prompt
       });
       const match = (res.text || '').match(/\{[\s\S]*\}/);
       const data = match ? JSON.parse(match[0]) : null;
       if (data) {
         setTranscript(prev => prev.map(t => {
           if (t.id === item.id) {
             return {
               ...t,
               corrections: [
                 { 
                   original: data.original || item.text, 
                   corrected: data.corrected || item.text, 
                   explanation: data.explanation || "Better phrased for natural flow."
                 }
               ]
             };
           }
           return t;
         }));
       }
     } catch (e) {
       console.error("Sentence correction failed", e);
     }
  };
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Real-time Metrics
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    pronunciationConfidence: 85,
    speakingSpeed: 120,
    fluency: 90,
    pauseTiming: 0,
    fillerWords: [],
    currentFeedback: "Go ahead, I'm listening"
  });

  // Track user speech session for metrics
  const userSpeechRef = useRef({
    startTime: 0,
    wordCount: 0,
    lastTranscriptTime: 0,
    fillerCount: 0
  });
  
  const [currentIceBreaker, setCurrentIceBreaker] = useState<string>("");
  const [showHints, setShowHints] = useState(false);
  
  const liveClientRef = useRef<LiveClient | null>(null);
  const timerRef = useRef<number | null>(null);
  const transcriptRef = useRef<TranscriptItem[]>([]);
  const durationRef = useRef<number>(0);
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const isEndingCallRef = useRef(false);
  const isUserSpeakingRef = useRef(false);

  useEffect(() => {
    isUserSpeakingRef.current = isUserSpeaking;
  }, [isUserSpeaking]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    if (callState === CallState.ACTIVE) {
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
        setDailySeconds(prev => prev + 1);
        
        // Update pause timing if user is supposed to be speaking but isn't
        if (isUserSpeakingRef.current) {
           setMetrics(prev => ({
              ...prev,
              pauseTiming: (Date.now() - userSpeechRef.current.lastTranscriptTime) / 1000
           }));
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (callState === CallState.IDLE) {
        setDuration(0);
        setIsMuted(false);
        setTranscript([]);
        setReport(null);
        setShowHints(false);
        setMetrics({
            pronunciationConfidence: 85,
            speakingSpeed: 120,
            fluency: 90,
            pauseTiming: 0,
            fillerWords: [],
            currentFeedback: ""
        });
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Handle speaker changes to reset session metrics
  useEffect(() => {
     if (isUserSpeaking) {
        userSpeechRef.current = {
            startTime: Date.now(),
            wordCount: 0,
            lastTranscriptTime: Date.now(),
            fillerCount: 0
        };
     }
  }, [isUserSpeaking]);

  const startCall = async (overrideScenario?: Scenario, overrideVoice?: VoiceConfig) => {
    if (!API_KEY) {
      setErrorMsg(API_KEY_ERROR);
      setCallState(CallState.ERROR);
      return;
    }

    isEndingCallRef.current = false;
    setCallState(CallState.CONNECTING);
    setErrorMsg(null);
    setTranscript([]);

    const scenario = overrideScenario || selectedScenario;
    const voice = overrideVoice || selectedVoice;
    
    // Pick ice breaker
    if (scenario.iceBreakers.length > 0) {
        const randomIdx = Math.floor(Math.random() * scenario.iceBreakers.length);
        setCurrentIceBreaker(scenario.iceBreakers[randomIdx]);
    }

    const fullSystemInstruction = `
      ${selectedLanguage.instruction}
      ${scenario.systemInstruction}
      ${selectedAccent.instruction}
      ${selectedStyle ? `USER IS PRACTICING SPEAKING LIKE A ${selectedStyle.label}. ${selectedStyle.instruction}` : ''}
      
      USER CONTEXT & MEMORY (Personalize your response):
      - Coach's Notes: ${userMemory.coachNotes}
      - Known Grammar Issues: ${userMemory.repeatedGrammarMistakes.join(', ') || 'None identified yet'}
      - Pronunciation Focus: ${userMemory.pronunciationWeaknesses.join(', ') || 'General clarity'}
      - Favorite Topics: ${userMemory.favoriteTopics.join(', ') || 'New learner'}
      - Avoided Patterns: ${userMemory.avoidedSentenceStructures.join(', ') || 'N/A'}
      
      ADAPTATION GUIDELINES:
      1. If the user makes a "Known Grammar Issue", provide a GENTLE, encouraging fix.
      2. Use "Favorite Topics" to build rapport if the conversation slows down.
      3. Encourage the user to try "Avoided Patterns" when appropriate.
      
      CONVERSATIONAL DYNAMICS:
      - Personality: ${voice.personality || 'friendly'}
      - Traits: ${PERSONALITIES[voice.personality as keyof typeof PERSONALITIES] || PERSONALITIES.friendly}
      - INTERACTIVE: Interrupt naturally with short affirmations ("Yeah", "I see", "Right").
      - EMOTIVE: Laugh, sigh, or sound surprised based on the context of the user's speech.
      - FLOW: Ask follow-up questions to keep the conversation going. If you don't understand, ask for clarification.
      - REALISM: Avoid "I am an AI". Be a real partner. Use natural pauses and occasionally fillers like "Well..." or "You know...".
    `;

    const client = new LiveClient({
      apiKey: API_KEY,
      voiceName: voice.name,
      systemInstruction: fullSystemInstruction,
      onOpen: () => {
        setCallState(CallState.ACTIVE);
      },
      onClose: () => {
        setCallState(prev => {
          if (prev === CallState.CONNECTING) {
            setErrorMsg("Connection could not be established. Please check your network or API key.");
            return CallState.ERROR;
          }
          return prev;
        });
        
        // Guard against duplicate end handler
        if (!isEndingCallRef.current) {
          const hasContent = transcriptRef.current.some(t => t.text.trim().length > 10);
          if (hasContent) {
            handleCallEnd();
          } else {
            setCallState(CallState.IDLE);
          }
        }
      },
      onError: (err) => {
        console.error(err);
        setErrorMsg(err.message);
        setCallState(CallState.ERROR);
      },
      onVolumeChange: (vol) => setVolume(vol),
      onUserSpeaking: (speaking) => setIsUserSpeaking(speaking),
      onAudioData: (speaker, blob) => {
         const url = URL.createObjectURL(blob);
         blobUrlsRef.current.add(url);
         setTranscript(prev => {
             const updated = [...prev];
             for (let i = updated.length - 1; i >= 0; i--) {
                 if (updated[i].speaker === speaker) {
                     if (updated[i].audioUrl) {
                         URL.revokeObjectURL(updated[i].audioUrl!);
                         blobUrlsRef.current.delete(updated[i].audioUrl!);
                     }
                     updated[i] = { ...updated[i], audioUrl: url };
                     break;
                 }
             }
             return updated;
         });
      },
      onTranscript: (speaker, text) => {
        if (speaker === 'user' && isUserSpeakingRef.current) {
           const words = text.trim().split(/\s+/).filter(w => w.length > 0);
           userSpeechRef.current.wordCount += words.length;
           userSpeechRef.current.lastTranscriptTime = Date.now();
           
           // Detect fillers
           const fillers = ["um", "uh", "like", "err", "ah"].filter(f => text.toLowerCase().includes(f));
           if (fillers.length > 0) userSpeechRef.current.fillerCount += fillers.length;

           // Calculate speed
           const elapsedMins = Math.max(0.1, (Date.now() - userSpeechRef.current.startTime) / 60000);
           const wpm = Math.round(userSpeechRef.current.wordCount / elapsedMins);
           
           // Heuristic feedback
           let feedback = "Natural pacing";
           if (wpm > 180) feedback = "Speaking too fast";
           else if (wpm < 80 && userSpeechRef.current.wordCount > 5) feedback = "Speaking slowly";
           else if (userSpeechRef.current.fillerCount > 3) feedback = "Too many filler words";
           else if (text.length > 20) feedback = "Great pronunciation";

           const fillerPenalty = Math.min(30, userSpeechRef.current.fillerCount * 5);
           const pacingBonus = (wpm >= 100 && wpm <= 160) ? 10 : 0;
           const confidenceCalc = Math.max(60, Math.min(98, 85 - fillerPenalty + pacingBonus));

           setMetrics(prev => ({
              ...prev,
              speakingSpeed: Math.min(220, Math.max(40, wpm)),
              fillerWords: fillers,
              currentFeedback: feedback,
              fluency: Math.max(50, 100 - (userSpeechRef.current.fillerCount * 5)),
              pronunciationConfidence: confidenceCalc
           }));
        }

        setTranscript(prev => {
           if (prev.length > 0) {
             const lastIndex = prev.length - 1;
             const lastItem = prev[lastIndex];
             if (lastItem.speaker === speaker) {
                const updatedItems = [...prev];
                const updatedText = lastItem.text + text;
                
                // Heuristic for real-time vocabulary
                let extra: any = {};
                if (speaker === 'model' && updatedText.length > 30 && !lastItem.vocabulary) {
                    const scenarioVocab = selectedScenario.vocabularyFocus.map(w => w.toLowerCase());
                    const generalVocab = [
                        "resilient", "pragmatic", "elaborate", "perspective", "innovative", 
                        "comprehensive", "collaborate", "substantial", "fundamental", "fascinating",
                        "efficient", "sustainable", "articulate", "crucial", "exceptional"
                    ];
                    const targetVocab = Array.from(new Set([...scenarioVocab, ...generalVocab]));
                    const found = targetVocab.find(w => updatedText.toLowerCase().includes(w));
                    if (found) {
                        extra.vocabulary = [{ 
                            word: found.charAt(0).toUpperCase() + found.slice(1), 
                            definition: "Target vocabulary highlighted for this context. Tap to save." 
                        }];
                    }
                }

                updatedItems[lastIndex] = {
                    ...lastItem,
                    text: updatedText,
                    ...extra
                };
                return updatedItems;
             }
           }
           
           // New Turn with ESL grammar checking
           let corrections: any[] = [];
           const grammarPatterns = [
               { regex: /\bi is\b/i, original: 'I is', corrected: 'I am', explanation: 'Use "am" with the first person "I".' },
               { regex: /\bhe go\b/i, original: 'he go', corrected: 'he goes', explanation: 'Third person singular present tense requires "-es".' },
               { regex: /\bshe go\b/i, original: 'she go', corrected: 'she goes', explanation: 'Third person singular present tense requires "-es".' },
               { regex: /\bthey is\b/i, original: 'they is', corrected: 'they are', explanation: 'Plural subject "they" requires "are".' },
               { regex: /\bwe was\b/i, original: 'we was', corrected: 'we were', explanation: 'Plural past tense requires "were".' },
               { regex: /\bhe have\b/i, original: 'he have', corrected: 'he has', explanation: 'Third person singular requires "has".' },
               { regex: /\bshe have\b/i, original: 'she have', corrected: 'she has', explanation: 'Third person singular requires "has".' },
               { regex: /\bmuch people\b/i, original: 'much people', corrected: 'many people', explanation: 'Use "many" with countable nouns like "people".' },
               { regex: /\bi am agree\b/i, original: 'I am agree', corrected: 'I agree', explanation: '"Agree" is already a verb; omit "am".' },
               { regex: /\bmore better\b/i, original: 'more better', corrected: 'better', explanation: '"Better" is already comparative; omit "more".' }
           ];
           if (speaker === 'user') {
             for (const p of grammarPatterns) {
               if (p.regex.test(text)) {
                 corrections.push({ original: p.original, corrected: p.corrected, explanation: p.explanation });
               }
             }
           }

           return [...prev, {
             id: crypto.randomUUID(),
             speaker,
             text,
             timestamp: new Date(),
             corrections: corrections.length > 0 ? corrections : undefined
           }];
        });
      }
    });

    liveClientRef.current = client;
    await client.connect();
  };

  const handleSurpriseMe = () => {
      const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      const randomVoice = VOICES[Math.floor(Math.random() * VOICES.length)];
      setSelectedScenario(randomScenario);
      setSelectedVoice(randomVoice);
      startCall(randomScenario, randomVoice);
  };

  const endCall = async () => {
    if (isEndingCallRef.current) return;
    const hasContent = transcriptRef.current.some(t => t.text.trim().length > 10);
    if (liveClientRef.current) {
      await liveClientRef.current.disconnect();
      liveClientRef.current = null;
    }
    if (hasContent) {
      await handleCallEnd();
    } else {
      setCallState(CallState.IDLE);
    }
  };

  const handleCallEnd = async () => {
    if (isEndingCallRef.current) return;
    isEndingCallRef.current = true;
    setCallState(CallState.ENDED);
    setIsAnalyzing(true);
    
    // Update Stats based on session duration & calculate streak
    const minutes = Math.max(1, Math.floor(durationRef.current / 60));
    const currentTranscript = transcriptRef.current;
    
    setUserStats(prev => {
      const today = new Date().toISOString().split('T')[0];
      const lastActive = prev.lastActiveDate ? prev.lastActiveDate.split('T')[0] : '';
      let newStreak = prev.streak || 1;
      if (lastActive && lastActive !== today) {
        const diffDays = Math.round((new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }

      const newXp = prev.xp + (minutes * 100) + (currentTranscript.length * 5);
      const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        lastActiveDate: new Date().toISOString(),
        totalSpeakingMinutes: prev.totalSpeakingMinutes + minutes,
        dailyGoals: prev.dailyGoals.map(g => {
          if (g.type === 'speaking_minutes') return { ...g, current: g.current + minutes };
          if (g.type === 'xp') return { ...g, current: g.current + (minutes * 100) };
          return g;
        })
      };
    });

    if (currentTranscript.length > 0) {
        const r = await generateAnalysisReport(API_KEY, currentTranscript, selectedAccent.label, selectedScenario, selectedStyle, selectedLanguage.label);
        r.averageWpm = metrics.speakingSpeed;
        setReport(r);
        
        // Update long-term memory
        const updatedMemory = await updateUserMemory(API_KEY, userMemory, r, selectedScenario.title);
        setUserMemory(updatedMemory);
    } else {
        setReport({
            score: 70, fluencyScore: 70, vocabularyScore: 70, grammarScore: 70, accentMatchScore: 70,
            vocabularyRichness: 65, confidenceScore: 70, grammarConsistency: 70, pacingScore: 70, fillerWordsDetected: 0,
            summary: "Session completed.", highlights: [], weakPoints: [], suggestions: [], performanceData: [70, 72, 75, 78, 80], corrections: [],
            averageWpm: metrics.speakingSpeed
        });
    }
    setIsAnalyzing(false);
  };

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (liveClientRef.current) {
        liveClientRef.current.setMute(nextState);
    }
  };

  const reset = () => {
    isEndingCallRef.current = false;
    setCallState(CallState.IDLE);
    setVolume(0);
    setDuration(0);
    setMimicPhrase(null);
    setTranscript([]);
    setReport(null);
    blobUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    blobUrlsRef.current.clear();
  };

  const handleMimicAttempt = async (audioBlob: Blob) => {
    const result = await analyzeMimicAttempt(API_KEY, mimicPhrase!, audioBlob, selectedAccent.label);
    
    // Update Stats on success
    if (result.prosodyScore > 70) {
      setUserStats(prev => ({
        ...prev,
        xp: prev.xp + 50,
        dailyGoals: prev.dailyGoals.map(g => 
          g.type === 'mimic_attempts' ? { ...g, current: g.current + 1 } : g
        )
      }));
    }
    
    return result;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper for hints
  const getHints = () => {
      // Very basic static hints based on scenario for demo
      if (selectedScenario.id.includes('ordering')) return ["I'd like a large pepperoni.", "How much is delivery?", "Can I pay by card?"];
      if (selectedScenario.id.includes('interview')) return ["My biggest strength is...", "I have 5 years of experience.", "I work well in teams."];
      if (selectedScenario.id.includes('doctor')) return ["I have a headache.", "I need an appointment.", "Is Tuesday available?"];
      return ["That's interesting, tell me more.", "I agree with you.", "What do you think?"];
  };

  // If showing report, occupy full screen with no scroll on body
  if (callState === CallState.ENDED) {
      return (
        <div className="h-screen w-full bg-[#131314] text-[#e3e3e3] font-sans overflow-hidden flex flex-col">
            {isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-pulse">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-2xl font-semibold text-gray-300">Generating Performance Report...</h2>
                    <p className="text-gray-500">Analyzing grammar, fluency, and accent...</p>
                </div>
            ) : report ? (
                <ReportCard report={report} onClose={reset} averageWpm={metrics.speakingSpeed} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                     <p className="text-red-400">Analysis failed.</p>
                     <button onClick={reset} className="mt-4 text-blue-400 underline">Back</button>
                </div>
            )}
        </div>
      );
  }

  const dailyProgressPercent = Math.min(100, (dailySeconds / (DAILY_GOAL_MINUTES * 60)) * 100);

  return (
    <div className="h-screen w-full bg-[#131314] text-[#e3e3e3] font-sans flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      {/* App Header removed */}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Configuration */}
        {callState === CallState.IDLE && (
            <div className="w-[360px] border-r border-[#2a2a2c] bg-[#1a1a1c] flex flex-col overflow-hidden shrink-0 shadow-2xl">
                <div className="p-4 border-b border-[#2a2a2c] flex items-center justify-between bg-[#1e1e20]">
                    <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">SESSION SETUP</h2>
                    <div className="flex items-center gap-1">
                        <div className={`w-1 h-1 rounded-full ${setupTab === 'language' ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                        <div className={`w-1 h-1 rounded-full ${setupTab === 'coach' ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                        <div className={`w-1 h-1 rounded-full ${setupTab === 'scenario' ? 'bg-emerald-500' : 'bg-gray-700'}`}></div>
                    </div>
                </div>

                {/* Setup Navigation Tabs */}
                <div className="flex border-b border-[#2a2a2c] bg-[#1e1e20]/50 sticky top-0 z-10">
                    <button 
                        onClick={() => setSetupTab('language')}
                        className={`flex-1 py-3 text-[9px] font-medium flex flex-col items-center gap-1.5 transition-all relative ${setupTab === 'language' ? 'text-emerald-400 bg-emerald-500/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Globe size={14} className={setupTab === 'language' ? 'text-emerald-400' : 'text-gray-600'} />
                        Goal
                        {setupTab === 'language' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>}
                    </button>
                    <button 
                        onClick={() => setSetupTab('coach')}
                        className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all relative ${setupTab === 'coach' ? 'text-emerald-400 bg-emerald-500/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <User size={14} className={setupTab === 'coach' ? 'text-emerald-400' : 'text-gray-600'} />
                        Coach
                        {setupTab === 'coach' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>}
                    </button>
                    <button 
                        onClick={() => setSetupTab('scenario')}
                        className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all relative ${setupTab === 'scenario' ? 'text-emerald-400 bg-emerald-500/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Compass size={14} className={setupTab === 'scenario' ? 'text-emerald-400' : 'text-gray-600'} />
                        Mission
                        {setupTab === 'scenario' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"></div>}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-gradient-to-b from-[#1a1a1c] to-[#121214]">
                    
                    {setupTab === 'language' && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Select Language</label>
                                    <span className="text-[10px] text-blue-400/50 italic font-medium">Step 1 of 3</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {PRACTICE_LANGUAGES.map(lang => (
                                        <button 
                                            key={lang.id}
                                            onClick={() => setSelectedLanguage(lang)}
                                            className={`group relative p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 
                                                ${selectedLanguage.id === lang.id 
                                                    ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.02]' 
                                                    : 'bg-[#232325]/50 border-white/5 hover:border-white/10 hover:bg-[#232325]'}`}
                                        >
                                            <span className="text-2xl drop-shadow-md transform group-hover:scale-110 transition-transform">{lang.flag}</span>
                                            <span className={`text-[10px] font-bold tracking-wide ${selectedLanguage.id === lang.id ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                {lang.label}
                                            </span>
                                            {selectedLanguage.id === lang.id && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-blue-500 rounded-full p-0.5 shadow-lg">
                                                    <Check size={10} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Accent Influence</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ACCENTS.map(accent => (
                                        <button 
                                            key={accent.id}
                                            onClick={() => setSelectedAccent(accent)}
                                            className={`px-4 py-3 text-[11px] font-bold rounded-2xl border transition-all duration-300 overflow-hidden relative group flex flex-col items-center gap-1.5
                                                ${selectedAccent.id === accent.id 
                                                    ? 'bg-blue-600/10 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                                                    : 'bg-[#232325]/50 border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'}`}
                                        >
                                            <span className="text-lg drop-shadow-sm transform group-hover:scale-110 transition-transform">{accent.flag}</span>
                                            <span className="tracking-wide uppercase text-[9px] opacity-80">{accent.label}</span>
                                            {selectedAccent.id === accent.id && (
                                                <div className="absolute top-0 right-0 p-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-600/5 rounded-2xl p-4 border border-blue-500/10 mt-auto">
                                <p className="text-[10px] text-blue-400/70 leading-relaxed font-medium italic">
                                    {`"I will help you master ${selectedLanguage.label} with a ${selectedAccent.label} influence through natural conversation."`}
                                </p>
                            </div>
                        </div>
                    )}

                    {setupTab === 'coach' && (
                        <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Select Your Tutor</label>
                                    <span className="text-[10px] text-blue-400/50 italic font-medium">Step 2 of 3</span>
                                </div>
                                <div className="space-y-2.5">
                                    {VOICES.map(voice => (
                                        <button
                                            key={voice.name}
                                            onClick={() => setSelectedVoice(voice)}
                                            className={`w-full group flex items-center gap-4 p-3.5 rounded-[20px] border transition-all duration-300 
                                                ${selectedVoice.name === voice.name 
                                                    ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                                                    : 'bg-[#232325]/30 border-white/5 hover:border-blue-500/20 hover:bg-[#232325]'}`}
                                        >
                                            <div className={`p-2.5 rounded-xl transition-all duration-300 ${selectedVoice.name === voice.name ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30' : 'bg-[#232325]/50 text-gray-500 group-hover:text-blue-400 group-hover:bg-blue-600/10'}`}>
                                                {voice.gender === 'male' ? (
                                                    <div className="relative">
                                                        <User size={18} strokeWidth={2.5} />
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full border border-[#1a1a1c]"></div>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <User size={18} strokeWidth={2.5} />
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-rose-400 rounded-full border border-[#1a1a1c]"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-left flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className={`text-sm font-bold ${selectedVoice.name === voice.name ? 'text-blue-100' : 'text-gray-300'}`}>{voice.label}</span>
                                                    {voice.personality && (
                                                        <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-md font-medium">
                                                            {voice.personality.replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-gray-500 line-clamp-1 group-hover:text-gray-400 transition-colors">{voice.description}</div>
                                            </div>
                                            {selectedVoice.name === voice.name && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="p-5 rounded-[24px] bg-[#1e1e20] border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                    <Sparkles size={48} className="text-blue-500" />
                                </div>
                                <h4 className="text-xs font-bold text-blue-500 mb-3 flex items-center gap-2 uppercase tracking-widest">
                                    <Sparkles size={12} />
                                    Coach Profile
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed italic relative z-10">
                                    {`"${PERSONALITIES[selectedVoice.personality as keyof typeof PERSONALITIES] || PERSONALITIES.friendly}"`}
                                </p>
                            </div>
                        </div>
                    )}

                    {setupTab === 'scenario' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Training Mission</label>
                                    <span className="text-[10px] text-blue-400/50 italic font-medium">Step 3 of 3</span>
                                </div>
                                <div className="space-y-2.5">
                                    {SCENARIOS.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedScenario(s)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-[22px] border transition-all duration-300 group
                                                ${selectedScenario.id === s.id 
                                                    ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                                                    : 'bg-[#232325]/30 border-white/5 hover:border-white/10 hover:bg-[#232325]'}`}
                                        >
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform">
                                                {s.emoji}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-sm font-bold ${selectedScenario.id === s.id ? 'text-white' : 'text-gray-400'}`}>{s.title}</span>
                                                    {selectedScenario.id === s.id && <Sparkles size={10} className="text-blue-500 animate-pulse" />}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${s.difficulty === 'beginner' ? 'text-emerald-500 bg-emerald-500/10' : s.difficulty === 'intermediate' ? 'text-amber-500 bg-amber-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                                                        {s.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={`transition-transform duration-300 ${selectedScenario.id === s.id ? 'text-blue-500 translate-x-1' : 'text-gray-700'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Saved Words Deck - Moved here as it's more of a reference */}
                            <div className="bg-black/20 rounded-3xl p-5 border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={14} className="text-blue-500" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vocabulary</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{savedWords.length}</span>
                                </div>
                                <div className="space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                                    {savedWords.length === 0 ? (
                                        <p className="text-[10px] text-gray-600 italic text-center py-4">No words saved yet.</p>
                                    ) : (
                                        savedWords.map((w, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs p-2.5 bg-white/2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                                                <span className="text-gray-300 font-medium">{w.word}</span>
                                                <Mic2 size={12} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 bg-[#1a1a1c] border-t border-[#2a2a2c] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ready</span>
                    </div>
                    {setupTab !== 'scenario' ? (
                        <button 
                            onClick={() => setSetupTab(setupTab === 'language' ? 'coach' : 'scenario')}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-900/40"
                        >
                            Next Step
                            <ChevronRight size={14} />
                        </button>
                    ) : (
                         <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">All Set</div>
                    )}
                </div>
            </div>
        )}

        {/* Center Stage - Visualizer or Call Info */}
        <div className="flex-1 bg-[#131314] relative flex flex-col">
            
            {/* Visualizer Container */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                {callState === CallState.IDLE ? (
                    <div className="z-10 w-full max-w-4xl px-6 animate-fade-in flex flex-col items-center">
                        {/* Tab Switcher */}
                        <div className="flex gap-1.5 bg-[#1a1a1c] p-1.5 rounded-2xl border border-white/10 mb-12 w-fit shadow-2xl">
                            <button 
                                onClick={() => setActiveTab('scenarios')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all flex items-center gap-2.5 ${activeTab === 'scenarios' ? 'bg-emerald-500 text-[#131314]' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <Compass size={14} />
                                Library
                            </button>
                            <button 
                                onClick={() => setActiveTab('stats')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 ${activeTab === 'stats' ? 'bg-emerald-500 text-[#131314]' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <BarChart2 size={14} />
                                Performance
                            </button>
                            <button 
                                onClick={() => setActiveTab('coach')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all flex items-center gap-2.5 relative ${activeTab === 'coach' ? 'bg-emerald-500 text-[#131314]' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <Sparkles size={14} />
                                Insights
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 border-2 border-[#131314]"></span>
                            </button>
                            <button 
                                onClick={() => setActiveTab('pronunciation')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all flex items-center gap-2.5 ${activeTab === 'pronunciation' ? 'bg-emerald-500 text-[#131314]' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                <Mic2 size={14} />
                                Speech Lab
                            </button>
                        </div>

                        {activeTab === 'scenarios' && (
                            <div className="w-full max-w-5xl flex flex-col gap-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="text-center lg:text-left flex flex-col justify-center">
                                        <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto lg:mx-0 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-8 transform -rotate-3">
                                            <Mic2 className="text-3xl text-white" size={36} />
                                        </div>
                                        <h2 className="text-5xl font-bold mb-6 tracking-tight text-white leading-tight">Ready to Master{"\n"}Your Conversational Skills?</h2>
                                        <p className="text-gray-400 mb-10 text-xl max-w-md font-medium leading-relaxed">
                                            Practice <span className="text-emerald-400 font-bold">{selectedScenario.title}</span> with <span className="text-white font-bold">{selectedVoice.label}</span>. Improve your <span className="text-emerald-400 font-bold">{selectedAccent.label}</span> accent in real-time.
                                        </p>
                                        
                                        <div className="flex flex-col gap-5 w-full">
                                            <button 
                                                onClick={() => startCall()}
                                                className="group relative w-full inline-flex items-center justify-center px-8 py-5 font-bold text-[#060706] transition-all duration-300 bg-emerald-500 rounded-[28px] hover:bg-emerald-400 shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-[0.98] overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                <span className="mr-3 text-lg">Start Conversation</span>
                                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            
                                            <button 
                                                onClick={handleSurpriseMe}
                                                className="w-full inline-flex items-center justify-center px-6 py-4 font-bold text-sm text-emerald-400 uppercase tracking-widest transition-all bg-[#1c1c1e] border border-white/5 rounded-2xl hover:bg-[#252527] hover:border-emerald-500/30"
                                            >
                                                <Zap size={14} className="mr-2 text-orange-500" fill="currentColor" />
                                                Surprise Selection
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-[#1c1c1e] p-8 rounded-[40px] border border-white/5 space-y-6 flex-1 shadow-2xl relative overflow-hidden">
                                         <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl opacity-50"></div>
                                         <SpeakLikeSelector 
                                            selectedStyleId={selectedStyle?.id || null} 
                                            onSelect={setSelectedStyle} 
                                         />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div className="w-full">
                                <StatsDashboard 
                                    stats={userStats} 
                                    dailyGoalMinutes={DAILY_GOAL_MINUTES}
                                    savedWords={savedWords} 
                                />
                            </div>
                        )}

                        {activeTab === 'coach' && (
                            <div className="w-full">
                                <CoachMemory memory={userMemory} />
                            </div>
                        )}

                        {activeTab === 'pronunciation' && (
                            <div className="w-full max-w-4xl animate-fade-in pb-20">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-6">
                                        <div className="bg-[#1e1e20] p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] group-hover:bg-emerald-500/10 transition-colors"></div>
                                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Speech Lab</h2>
                                            <p className="text-gray-400 text-sm mb-8">Select a phrase from <span className="text-emerald-400 font-bold">{selectedScenario.title}</span> to master your delivery and accent.</p>
                                            
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                {(selectedScenario.practicePhrases || ["I'd like to book a flight, please.", "How much does that cost?", "Could you repeat that?"]).map((p, i) => (
                                                    <button 
                                                        key={i}
                                                        onClick={() => setMimicPhrase(p)}
                                                        className="w-full text-left p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">"{p}"</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-gray-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Practice</span>
                                                                <ChevronRight size={14} className="text-gray-600 group-hover:text-emerald-400 translate-x-0 group-hover:translate-x-1 transition-all" />
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-emerald-500 rounded-xl">
                                                    <Sparkles size={16} className="text-[#060706]" />
                                                </div>
                                                <div>
                                                    <h4 className="text-emerald-400 font-bold text-[10px] mb-1 uppercase tracking-widest">Coach Tip</h4>
                                                    <p className="text-gray-400 text-sm leading-relaxed">Try to match the rhythm and stress. <span className="text-emerald-300 font-medium">{selectedLanguage.label}</span> has unique pitch patterns, focus on emulating the instructor!</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center bg-[#1e1e20] rounded-[40px] border border-white/5 p-10 text-center sticky top-0 min-h-[500px] shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none"></div>
                                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 relative">
                                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                                            <Mic2 size={40} className="text-emerald-400 relative z-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight uppercase tracking-widest">Visual Feedback</h3>
                                        <p className="text-gray-500 text-sm max-w-xs mb-4">Speak into the microphone to see your pitch and intensity visualized in real-time.</p>
                                        
                                        <div className="w-full h-32 bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center mb-8">
                                            <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Waiting for Pulse...</p>
                                        </div>

                                        <p className="text-gray-400 text-xs mb-8 font-medium leading-relaxed">Our AI analyzes your pitch, volume, and phoneme accuracy in real-time.</p>
                                        
                                        <div className="w-full flex-1 bg-black/20 rounded-[32px] border border-dashed border-white/5 flex flex-col items-center justify-center p-8 gap-4">
                                            <Mic2 size={32} className="text-gray-800" />
                                            <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">Select a phrase to start</p>
                                        </div>

                                        <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                                            <div className="p-5 bg-white/2 rounded-2xl border border-white/5 text-left">
                                                <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Accent</p>
                                                <p className="text-white font-semibold text-sm">{selectedAccent.label}</p>
                                            </div>
                                            <div className="p-5 bg-white/2 rounded-2xl border border-white/5 text-left">
                                                <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Language</p>
                                                <p className="text-white font-semibold text-sm">{selectedLanguage.label}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="z-10 flex flex-col items-center w-full max-w-2xl px-4">
                        
                        {/* Ice Breaker Card (Visible at start) */}
                        {duration < 8 && currentIceBreaker && (
                            <div className="mb-8 animate-fade-in-down">
                                <div className="bg-[#1e1e20]/90 backdrop-blur-md border border-blue-500/30 px-6 py-4 rounded-2xl shadow-2xl text-center max-w-md mx-auto">
                                    <span className="text-xs font-bold text-blue-400 mb-1 block uppercase tracking-widest">Ice Breaker</span>
                                    <p className="text-lg font-medium text-white">"{currentIceBreaker}"</p>
                                </div>
                            </div>
                        )}

                        <Visualizer 
                           volume={volume} 
                           isConnected={callState === CallState.ACTIVE} 
                           isUserSpeaking={isUserSpeaking}
                        />

                        {callState === CallState.ACTIVE && (
                            <div className="w-full mt-12 animate-fade-in flex flex-col items-center gap-10">
                                <FluencyMeter 
                                    fluency={metrics.fluency} 
                                    isUserSpeaking={isUserSpeaking} 
                                />
                                <LiveCoach metrics={metrics} isUserSpeaking={isUserSpeaking} />
                            </div>
                        )}
                        
                        <div className={`mt-10 px-6 py-2.5 bg-[#1a1a1c] rounded-2xl border border-white/5 flex items-center gap-3 transition-opacity duration-500 shadow-xl ${isUserSpeaking ? 'opacity-20' : 'opacity-100'}`}>
                             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">MISSION ALPHA</span>
                             <span className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="text-lg leading-none">{selectedScenario.emoji}</span>
                                {selectedScenario.title}
                             </span>
                        </div>

                        {/* Hint Bubbles */}
                        {showHints && (
                            <div className="mt-6 flex flex-wrap justify-center gap-3 animate-fade-in-up">
                                {getHints().map((hint, i) => (
                                    <button 
                                        key={i} 
                                        className="bg-[#2a2a2c] hover:bg-[#333] border border-[#444] hover:border-blue-500 text-sm px-4 py-2 rounded-full transition-all text-gray-300"
                                        onClick={() => setShowHints(false)}
                                    >
                                        {hint}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Control Bar (During Active Call) */}
            {(callState === CallState.ACTIVE || callState === CallState.CONNECTING) && (
                <CallControls 
                    isMuted={isMuted}
                    showHints={showHints}
                    showTranscript={showTranscript}
                    onToggleMute={toggleMute}
                    onToggleHints={() => setShowHints(!showHints)}
                    onToggleTranscript={() => setShowTranscript(!showTranscript)}
                    onEndCall={endCall}
                />
            )}
        </div>

        {/* Right Sidebar - Transcript (Visible during call) */}
        {showTranscript && (callState === CallState.ACTIVE || callState === CallState.CONNECTING) && (
            <div className="w-96 border-l border-[#444746] bg-[#1a1a1c] flex flex-col overflow-hidden shrink-0 transition-all duration-300">
                <div className="p-4 border-b border-[#444746] flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Transcript</h3>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0">
                        <Transcript 
                            items={transcript} 
                            onSaveWord={saveWord}
                            onExplainPhrase={explainPhrase}
                            onCorrectSentence={correctSentence}
                            onPracticePhrase={(text) => setMimicPhrase(text)}
                        />
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* Error Overlay */}
      {errorMsg && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-xl z-[100] px-4">
              <motion.div 
                initial={{ opacity: 0, y: -50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-[#1e1e20] border-2 border-rose-500/50 text-white p-6 rounded-[32px] flex items-center gap-6 shadow-[0_40px_80px_rgba(244,63,94,0.3)] backdrop-blur-2xl"
              >
                  <div className="w-14 h-14 bg-rose-500/20 rounded-2xl flex items-center justify-center shrink-0">
                      <AlertCircle size={28} className="text-rose-500" />
                  </div>
                  <div className="flex-1">
                      <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-1">
                          {errorMsg.toLowerCase().includes('mic') || errorMsg.toLowerCase().includes('permission') 
                              ? 'Microphone Access Error' 
                              : errorMsg.toLowerCase().includes('key') 
                              ? 'API Key Notice' 
                              : errorMsg.toLowerCase().includes('network') || errorMsg.toLowerCase().includes('connect')
                              ? 'Connection Notice'
                              : 'Session Notice'}
                      </h3>
                      <p className="text-gray-300 text-sm font-medium leading-relaxed">{errorMsg}</p>
                  </div>
                  <button 
                    onClick={() => setErrorMsg(null)} 
                    className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-colors"
                  >
                      <X size={20} />
                  </button>
              </motion.div>
          </div>
      )}

      {/* Mimic Trainer Overlay */}
      {mimicPhrase && (
          <MimicTrainer 
            phrase={mimicPhrase}
            nativeVoice={selectedVoice.name}
            onAttempt={handleMimicAttempt}
            onClose={() => setMimicPhrase(null)}
          />
      )}

    </div>
  );
};

export default App;