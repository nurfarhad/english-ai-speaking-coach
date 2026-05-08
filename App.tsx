import React, { useState, useEffect, useRef } from 'react';
import { CallState, VoiceName, Scenario, VoiceConfig, TranscriptItem, AnalysisReport, SavedWord, RealTimeMetrics, UserStats, UserMemory, SpeakLikeStyle } from './types';
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
import { SCENARIOS, VOICES, ACCENTS, API_KEY_ERROR, DEFAULT_ACHIEVEMENTS, DEFAULT_GOALS, PERSONALITIES, SPEAK_LIKE_STYLES } from './constants';

const API_KEY = process.env.GEMINI_API_KEY || '';
const DAILY_GOAL_MINUTES = 15;

const App: React.FC = () => {
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceConfig>(VOICES[0]); 
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]); 
  const [selectedStyle, setSelectedStyle] = useState<SpeakLikeStyle | null>(null);
  
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0); // Current call duration in seconds
  const [dailySeconds, setDailySeconds] = useState(320); // Simulating some previous progress (5m 20s)
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [showTranscript, setShowTranscript] = useState(true);
  const [report, setReport] = useState<AnalysisReport | null>(null);

  const [mimicPhrase, setMimicPhrase] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'stats' | 'coach'>('scenarios');
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 1250,
    level: 4,
    streak: 7,
    lastActiveDate: new Date().toISOString(),
    totalSpeakingMinutes: 42,
    vocabularyMastered: 12,
    achievements: DEFAULT_ACHIEVEMENTS,
    dailyGoals: DEFAULT_GOALS
  });

  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  
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
        coachNotes: "Welcome! I'm your AI English tutor. I'll be tracking your progress to personalize each session.",
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
        return [{ word: cleanWord, timestamp: new Date() }, ...prev];
    });
  };

  const explainPhrase = async (phrase: string) => {
    // This could be another AI call, for now we add to current feedback
    setMetrics(prev => ({
        ...prev,
        currentFeedback: `Explaining "${phrase}"...`
    }));
    
    // Simulate finding a definition
    setTimeout(() => {
        setMetrics(prev => ({
            ...prev,
            currentFeedback: `${phrase}: A resilient person is able to withstand or recover quickly from difficult conditions.`
        }));
    }, 1500);
  };

  const correctSentence = (item: TranscriptItem) => {
     // Trigger special feedback for the item
     setTranscript(prev => prev.map(t => {
         if (t.id === item.id) {
             return {
                 ...t,
                 corrections: [
                     { 
                         original: item.text.split(' ').slice(0, 3).join(' '), 
                         corrected: "Better phrased version", 
                         explanation: "Using more natural phrasing for this scenario."
                     }
                 ]
             };
         }
         return t;
     }));
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
        if (isUserSpeaking) {
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
  }, [callState, isUserSpeaking]);

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
        
        // Only show dashboard if we actually had a meaningful conversation
        const hasContent = transcriptRef.current.some(t => t.text.trim().length > 10);
        if (hasContent) {
          handleCallEnd();
        } else {
          setCallState(CallState.IDLE);
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
         setTranscript(prev => {
             // Find the last item from this speaker and attach audio
             const updated = [...prev];
             for (let i = updated.length - 1; i >= 0; i--) {
                 if (updated[i].speaker === speaker) {
                     updated[i] = { ...updated[i], audioUrl: url };
                     break;
                 }
             }
             return updated;
         });
      },
      onTranscript: (speaker, text) => {
        if (speaker === 'user' && isUserSpeaking) {
           const words = text.trim().split(/\s+/).filter(w => w.length > 0);
           userSpeechRef.current.wordCount += words.length;
           userSpeechRef.current.lastTranscriptTime = Date.now();
           
           // Detect fillers
           const fillers = ["um", "uh", "like", "err", "ah"].filter(f => text.toLowerCase().includes(f));
           if (fillers.length > 0) userSpeechRef.current.fillerCount += fillers.length;

           // Calculate speed
           const elapsedMins = (Date.now() - userSpeechRef.current.startTime) / 60000;
           const wpm = elapsedMins > 0 ? Math.round(userSpeechRef.current.wordCount / elapsedMins) : 120;
           
           // Heuristic feedback
           let feedback = "Natural pacing";
           if (wpm > 180) feedback = "Speaking too fast";
           else if (wpm < 80 && userSpeechRef.current.wordCount > 5) feedback = "Speaking slowly";
           else if (userSpeechRef.current.fillerCount > 3) feedback = "Too many filler words";
           else if (text.length > 20) feedback = "Great pronunciation";

           setMetrics(prev => ({
              ...prev,
              speakingSpeed: wpm,
              fillerWords: fillers,
              currentFeedback: feedback,
              fluency: Math.max(50, 100 - (userSpeechRef.current.fillerCount * 5)),
              pronunciationConfidence: Math.min(100, 85 + (text.length / 10))
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
                if (speaker === 'model' && updatedText.length > 40 && !lastItem.vocabulary) {
                    const words = ["resilient", "pragmatic", "elaborate", "perspective"];
                    const found = words.find(w => updatedText.toLowerCase().includes(w));
                    if (found) {
                        extra.vocabulary = [{ 
                            word: found.charAt(0).toUpperCase() + found.slice(1), 
                            definition: "Click to see full explanation." 
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
           
           // New Turn
           let corrections: any[] = [];
           if (speaker === 'user' && text.toLowerCase().includes('i is')) {
               corrections.push({ original: 'I is', corrected: 'I am', explanation: 'Use "am" with "I".' });
           }
           if (speaker === 'user' && text.toLowerCase().includes('he go')) {
               corrections.push({ original: 'he go', corrected: 'he goes', explanation: 'Third person singular needs "es".' });
           }

           return [...prev, {
             id: Date.now().toString() + Math.random(),
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
    if (liveClientRef.current) {
      await liveClientRef.current.disconnect();
      liveClientRef.current = null;
    }
  };

  const handleCallEnd = async () => {
    setCallState(CallState.ENDED);
    setIsAnalyzing(true);
    
    // Update Stats based on session duration
    const minutes = Math.floor(durationRef.current / 60);
    const currentTranscript = transcriptRef.current;
    
    setUserStats(prev => ({
      ...prev,
      xp: prev.xp + (minutes * 100) + (currentTranscript.length * 5),
      totalSpeakingMinutes: prev.totalSpeakingMinutes + minutes,
      dailyGoals: prev.dailyGoals.map(g => {
        if (g.type === 'speaking_minutes') return { ...g, current: g.current + minutes };
        if (g.type === 'xp') return { ...g, current: g.current + (minutes * 100) };
        return g;
      })
    }));

    if (currentTranscript.length > 0) {
        const r = await generateAnalysisReport(API_KEY, currentTranscript, selectedAccent.label, selectedScenario, selectedStyle);
        setReport(r);
        
        // Update long-term memory
        const updatedMemory = await updateUserMemory(API_KEY, userMemory, r, selectedScenario.title);
        setUserMemory(updatedMemory);
    } else {
        setReport({
            score: 0, fluencyScore: 0, vocabularyScore: 0, grammarScore: 0, accentMatchScore: 0,
            vocabularyRichness: 0, confidenceScore: 0, grammarConsistency: 0, pacingScore: 0, fillerWordsDetected: 0,
            summary: "No conversation detected.", highlights: [], weakPoints: [], suggestions: [], performanceData: [], corrections: []
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
    setCallState(CallState.IDLE);
    setVolume(0);
    setDuration(0);
    setMimicPhrase(null);
    setTranscript([]);
    setReport(null);
  };

  const handleMimicAttempt = async (audioBlob: Blob) => {
    // In a real app, we'd transcribe this blob first.
    await new Promise(r => setTimeout(r, 1500));
    const result = await analyzeMimicAttempt(API_KEY, mimicPhrase!, "User audio simulation...", selectedAccent.label);
    
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
                <ReportCard report={report} onClose={reset} />
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
    <div className="h-screen w-full bg-[#131314] text-[#e3e3e3] font-sans flex flex-col overflow-hidden">
      
      {/* App Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-[#444746] bg-[#1e1e20] shrink-0">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
                <span className="material-icons-round text-white text-lg">school</span>
             </div>
             <h1 className="text-lg font-semibold tracking-wide">Antigravity AI <span className="text-gray-500 font-normal mx-2">|</span> <span className="text-blue-400 font-medium">Coach v4.0</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowStats(true)}
            className="hidden md:flex items-center gap-4 bg-[#2a2a2c] px-4 py-1.5 rounded-full border border-[#444746] hover:bg-[#333] transition-colors group"
          >
              <div className="flex flex-col items-end mr-1">
                  <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Level {userStats.level}</span>
                  <div className="w-24 h-1 bg-[#444] rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(userStats.xp % 1000) / 10}%` }}></div>
                  </div>
              </div>
              <span className="material-icons-round text-yellow-400 group-hover:scale-125 transition-transform">insights</span>
          </button>

          {callState === CallState.ACTIVE && (
               <div className="flex items-center gap-2 bg-[#2a2a2c] px-3 py-1 rounded-full border border-[#444746]">
                   <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                   <span className="font-mono text-xs">{formatTime(duration)}</span>
               </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Configuration */}
        {callState === CallState.IDLE && (
            <div className="w-80 border-r border-[#444746] bg-[#1a1a1c] flex flex-col overflow-hidden shrink-0">
                <div className="p-5 border-b border-[#444746]">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Session Setup</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-8">
                    {/* Saved Words Deck */}
                    <div className="bg-[#232325] rounded-xl p-4 border border-[#333]">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase">Saved Vocabulary</span>
                            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">{savedWords.length}</span>
                        </div>
                        <div className="space-y-2">
                            {savedWords.map((w, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-[#2a2a2c] rounded cursor-pointer group">
                                    <span className="text-gray-200">{w.word}</span>
                                    <span className="material-icons-round text-gray-600 group-hover:text-blue-400 text-sm">volume_up</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Configuration Forms */}
                    <div>
                        <label className="text-xs text-gray-400 mb-2 block uppercase font-semibold">Tutor Voice</label>
                        <div className="space-y-2">
                             {VOICES.slice(0, 4).map(voice => (
                                 <button
                                     key={voice.name}
                                     onClick={() => setSelectedVoice(voice)}
                                     className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all ${selectedVoice.name === voice.name ? 'bg-blue-600/20 border-blue-500 text-blue-100' : 'border-transparent hover:bg-[#2a2a2c]'}`}
                                 >
                                     <span className="material-icons-round text-lg bg-[#2a2a2c] p-1 rounded-md">{voice.gender === 'Male' ? 'face' : 'face_3'}</span>
                                     <div className="text-left flex-1">
                                         <div className="flex items-center justify-between">
                                             <div className="text-sm font-medium">{voice.label}</div>
                                             {voice.personality && (
                                                 <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">
                                                     {voice.personality.replace('_', ' ')}
                                                 </span>
                                             )}
                                         </div>
                                         <div className="text-[10px] opacity-60 line-clamp-1">{voice.description}</div>
                                     </div>
                                 </button>
                             ))}
                        </div>
                        <p className="mt-3 text-[10px] text-gray-500 italic bg-white/2 p-2 rounded-lg border border-white/5">
                            <span className="font-bold text-gray-400 not-italic uppercase tracking-widest mr-1 underline decoration-blue-500/30">Behavior:</span>
                            {PERSONALITIES[selectedVoice.personality as keyof typeof PERSONALITIES] || PERSONALITIES.friendly}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-2 block uppercase font-semibold">Accent</label>
                        <div className="grid grid-cols-2 gap-2">
                            {ACCENTS.map(accent => (
                                <button 
                                    key={accent.id}
                                    onClick={() => setSelectedAccent(accent)}
                                    className={`px-3 py-2 text-xs rounded-md border text-center transition-all ${selectedAccent.id === accent.id ? 'bg-blue-600/20 border-blue-500 text-white' : 'border-[#444746] text-gray-400 hover:border-gray-500'}`}
                                >
                                    {accent.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 mb-2 block uppercase font-semibold">Scenario</label>
                        <div className="space-y-2">
                            {SCENARIOS.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelectedScenario(s)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group
                                        ${selectedScenario.id === s.id ? 'bg-[#2a2a2c] border-blue-500' : 'bg-[#1e1e20] border-[#333] hover:border-[#555]'}
                                    `}
                                >
                                    <span className="text-xl group-hover:scale-110 transition-transform">{s.emoji}</span>
                                    <span className={`text-sm font-medium ${selectedScenario.id === s.id ? 'text-white' : 'text-gray-400'}`}>{s.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
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
                        <div className="flex gap-1 bg-[#1e1e20] p-1 rounded-xl border border-white/5 mb-10 w-fit">
                            <button 
                                onClick={() => setActiveTab('scenarios')}
                                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'scenarios' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <span className="material-icons-round text-sm">rocket_launch</span>
                                Practice
                            </button>
                            <button 
                                onClick={() => setActiveTab('stats')}
                                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <span className="material-icons-round text-sm">leaderboard</span>
                                Stats
                            </button>
                            <button 
                                onClick={() => setActiveTab('coach')}
                                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'coach' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <span className="material-icons-round text-sm">psychology</span>
                                Coach Insights
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,44,44,0.5)]"></span>
                            </button>
                        </div>

                        {activeTab === 'scenarios' && (
                            <div className="w-full max-w-2xl flex flex-col gap-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="text-center md:text-left flex flex-col justify-center">
                                        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto md:mx-0 flex items-center justify-center shadow-2xl shadow-blue-600/30 mb-6">
                                            <span className="material-icons-round text-3xl text-white">record_voice_over</span>
                                        </div>
                                        <h2 className="text-3xl font-bold mb-3 tracking-tight">Ready to roll?</h2>
                                        <p className="text-gray-400 mb-8 text-lg">
                                            Practice <span className="text-blue-400 font-medium">{selectedScenario.title.toLowerCase()}</span> with <span className="text-blue-400 font-medium">{selectedVoice.label}</span> in a <span className="text-white">{selectedAccent.label}</span> accent.
                                        </p>
                                        
                                        <div className="flex flex-col gap-4">
                                            <button 
                                                onClick={() => startCall()}
                                                className="group relative w-full inline-flex items-center justify-center px-8 py-5 font-bold text-white transition-all duration-200 bg-blue-600 rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-900/40 active:scale-[0.98] overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:animate-shimmer" />
                                                <span className="mr-3 text-lg">Start Conversation</span>
                                                <span className="material-icons-round group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            </button>
                                            
                                            <button 
                                                onClick={handleSurpriseMe}
                                                className="w-full inline-flex items-center justify-center px-6 py-4 font-bold text-blue-200 transition-all bg-[#2a2a2c] border border-blue-500/20 rounded-2xl hover:bg-[#333] hover:border-blue-400 hover:text-white"
                                            >
                                                <span className="material-icons-round mr-2 text-yellow-400">bolt</span>
                                                Surprise Selection
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-[#1c1c1e] p-6 rounded-3xl border border-white/5 space-y-6">
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
                    </div>
                ) : (
                    <div className="z-10 flex flex-col items-center w-full max-w-2xl px-4">
                        
                        {/* Ice Breaker Card (Visible at start) */}
                        {duration < 8 && currentIceBreaker && (
                            <div className="mb-8 animate-fade-in-down">
                                <div className="bg-[#1e1e20]/90 backdrop-blur-md border border-blue-500/30 px-6 py-4 rounded-2xl shadow-2xl text-center max-w-md mx-auto">
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1 block">Ice Breaker</span>
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
                            <div className="w-full mt-12 animate-fade-in">
                                <LiveCoach metrics={metrics} isUserSpeaking={isUserSpeaking} />
                            </div>
                        )}
                        
                        <div className={`mt-8 px-4 py-2 bg-[#1e1e20] rounded-full border border-[#333] flex items-center gap-2 transition-opacity duration-500 ${isUserSpeaking ? 'opacity-20' : 'opacity-100'}`}>
                             <span className="text-sm text-gray-400">Scenario:</span>
                             <span className="text-sm font-medium text-white flex items-center gap-1">
                                {selectedScenario.emoji} {selectedScenario.title}
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
                <div className="h-20 bg-[#1e1e20] border-t border-[#444746] flex items-center justify-center gap-6 shrink-0 z-20">
                     <button 
                        onClick={() => setShowTranscript(!showTranscript)}
                        className={`p-3 rounded-full transition-colors ${showTranscript ? 'bg-[#333] text-white' : 'text-gray-400 hover:bg-[#2a2a2c]'}`}
                        title="Toggle Transcript"
                     >
                        <span className="material-icons-round">subtitles</span>
                     </button>

                     <button 
                        onClick={toggleMute}
                        className={`h-14 w-14 rounded-full flex items-center justify-center text-xl transition-all ${isMuted ? 'bg-white text-red-600' : 'bg-[#2a2a2c] text-white hover:bg-[#333] border border-[#444]'}`}
                     >
                        <span className="material-icons-round">{isMuted ? 'mic_off' : 'mic'}</span>
                     </button>
                    
                     <button 
                        onClick={() => setShowHints(!showHints)}
                        className={`p-3 rounded-full transition-colors ${showHints ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-[#2a2a2c]'}`}
                        title="Get a Hint"
                     >
                        <span className="material-icons-round">lightbulb</span>
                     </button>

                     <button 
                        onClick={endCall}
                        className="h-14 px-8 bg-red-600 hover:bg-red-500 text-white rounded-full font-medium shadow-lg shadow-red-900/30 flex items-center gap-2 transition-transform active:scale-95"
                     >
                        <span className="material-icons-round">call_end</span>
                        <span>End Session</span>
                     </button>
                </div>
            )}
        </div>

        {/* Right Sidebar - Transcript (Visible during call) */}
        {showTranscript && (callState === CallState.ACTIVE || callState === CallState.CONNECTING) && (
            <div className="w-96 border-l border-[#444746] bg-[#1a1a1c] flex flex-col overflow-hidden shrink-0 transition-all duration-300">
                <div className="p-4 border-b border-[#444746] flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Transcript</h3>
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
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500 text-red-200 px-6 py-3 rounded-lg flex items-center gap-3 backdrop-blur-md z-50 animate-bounce">
              <span className="material-icons-round">error</span>
              {errorMsg}
              <button onClick={() => setErrorMsg(null)} className="ml-2 hover:text-white"><span className="material-icons-round text-sm">close</span></button>
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

      {/* Stats Dashboard Overlay */}
      {showStats && (
        <StatsDashboard 
          stats={userStats}
          onClose={() => setShowStats(false)}
        />
      )}

    </div>
  );
};

export default App;