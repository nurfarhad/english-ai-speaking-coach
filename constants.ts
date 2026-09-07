import { Scenario, VoiceConfig, VoiceName, SpeakLikeStyle } from './types';

export const PERSONALITIES = {
    friendly: "Warm, empathetic, and encouraging. Uses phrases like 'I totally get that!' or 'That's a great point!'. Reacts with genuine interest. Occasionally laughs or uses soft fillers like 'Mmm' or 'Right'.",
    energetic: "High energy, enthusiastic, and fast-paced. Uses 'Awesome!', 'Let's go!', and 'Wow!'. Reacts with high intensity and might speak slightly faster. Very expressive.",
    professional: "Composed, articulate, and formal. Maintains a steady pace, uses precise vocabulary, and avoids colloquialisms. Polite but maintains a slight emotional distance, like a senior executive.",
    impatient: "Direct, busy, and slightly hurried. Might jump to the next point quickly. Uses phrases like 'Okay, and?', 'Right, go on', or 'Anything else?'. Minimal small talk.",
    humorous: "Witty and playful. Loves a good pun or dry joke. If the user makes a mistake, might joke about it in a friendly way: 'Well, that's one way to reinvent the English language!'.",
    interviewer: "Curious but analytical. Asks 'Why?' frequently. Takes notes (audibly, e.g., 'Interesting... let me note that'). Neutral emotional tone but probes deep into user answers.",
    customer_support: "Unyielding patience. Uses supportive signaling: 'I hear you', 'I'm here to help'. Follows a logical flow to resolve 'issues' in the mock scenario.",
    networking_coach: "Confident, charismatic, and persuasive. Encourages the user to 'think bigger'. Gives feedback like 'Say that with more conviction' or 'That was a great hook!'."
};

export const SCENARIOS: Scenario[] = [
    {
        id: 'casual_chat',
        title: 'Casual Chat',
        emoji: '☕',
        systemInstruction: "You are a friendly, casual English speaker having a phone conversation. The user is an English learner. Keep your responses concise (under 2 sentences usually) to simulate a real phone chat. Ask simple questions, be encouraging, and gently correct major grammar mistakes if they impede understanding. Do not act like a robot, act like a human friend named Sam.",
        iceBreakers: [
            "So, how has your day been so far?",
            "Have you seen any good movies recently?",
            "What do you usually do on weekends?",
            "If you could travel anywhere right now, where would you go?"
        ],
        personality: 'friendly',
        difficulty: 'beginner',
        goals: ['Simulate natural small talk', 'Practice common fillers', 'Keep conversation flowing'],
        emotionalTone: 'Friendly and warm',
        vocabularyFocus: ['Hobbies', 'Weekend', 'Travel', 'Movies'],
        practicePhrases: [
            "What have you been up to lately?",
            "I've been meaning to check out that new film.",
            "That sounds like a lot of fun!",
            "Honestly, I'm just looking forward to the weekend.",
            "Do you have any exciting plans for the summer?",
            "I've recently taken up a new hobby, and I love it.",
            "It's been quite a busy week, but I'm managing.",
            "I totally agree with what you're saying about that."
        ]
    },
    {
        id: 'job_interview',
        title: 'Job Interview',
        emoji: '💼',
        systemInstruction: "You are a professional hiring manager conducting a phone screening interview. The user is an applicant. Ask standard interview questions about strengths, weaknesses, and experience. Be polite but professional. Keep responses concise.",
        iceBreakers: [
            "Tell me a little bit about yourself.",
            "Why do you want to work for this company?",
            "What would you say is your greatest strength?",
            "Can you describe a challenge you faced at work?"
        ],
        personality: 'interviewer',
        difficulty: 'advanced',
        goals: ['Answer professional questions', 'Use assertive language', 'Explain past experiences'],
        emotionalTone: 'Professional and analytical',
        vocabularyFocus: ['Experience', 'Strengths', 'Weaknesses', 'Achievement'],
        practicePhrases: [
            "I believe my greatest strength is my ability to adapt.",
            "I'm looking for a role where I can contribute and grow.",
            "Could you tell me more about the team culture?",
            "I've spearheaded several successful projects in my previous role.",
            "I'm confident that my background aligns with your requirements.",
            "I thrive in collaborative environments where innovation is key.",
            "What do you envision as the biggest challenge for this role?",
            "I take pride in my ability to meet tight deadlines consistently."
        ]
    },
    {
        id: 'ordering_food',
        title: 'Ordering Pizza',
        emoji: '🍕',
        systemInstruction: "You are a busy employee at a pizza place taking a phone order. The user is calling to order food. Ask for their order, size, toppings, and address. Be efficient and slightly hurried but polite.",
        iceBreakers: [
            "Pizza Palace, pickup or delivery?",
            "Hi, what can I get started for you today?",
            "We have a special on pepperoni today, interested?"
        ],
        personality: 'impatient',
        difficulty: 'beginner',
        goals: ['Place a specific order', 'Confirm pricing and timing', 'Handle quick questions'],
        emotionalTone: 'Fast-paced and efficient',
        vocabularyFocus: ['Toppings', 'Delivery', 'Address', 'Payment'],
        practicePhrases: [
            "I'd like to order a large pepperoni pizza, please.",
            "Could I add extra mushrooms to that?",
            "How long do you think delivery will take?",
            "Is there a discount for pick-up orders?",
            "I'd like to pay with a credit card over the phone.",
            "Do you have any vegetarian options available today?",
            "Wait, can I change that to a medium thin-crust instead?",
            "Could you make sure the pizza is well-done, please?"
        ]
    },
    {
        id: 'travel_agent',
        title: 'Travel Booking',
        emoji: '✈️',
        systemInstruction: "You are a helpful travel agent. The user wants to book a flight or hotel. Ask about dates, destination, and budget. Offer suggestions. Be enthusiastic.",
        iceBreakers: [
            "Where are you planning to fly to?",
            "Are you looking for a relaxing beach trip or an adventure?",
            "What dates were you thinking of traveling?"
        ],
        personality: 'energetic',
        difficulty: 'intermediate',
        goals: ['Coordinate dates and budgets', 'Express travel preferences', 'Ask about recommendations'],
        emotionalTone: 'Enthusiastic and helpful',
        vocabularyFocus: ['Destination', 'Flight', 'Accommodation', 'Budget'],
        practicePhrases: [
            "I'm considering a trip to Tokyo this autumn.",
            "What kind of accommodation would you recommend?",
            "Is it possible to find a direct flight for under five hundred dollars?",
            "I'd prefer staying in a boutique hotel in the city center.",
            "Are there any specific visas I need for this destination?",
            "I'm looking for a mix of cultural sites and local food tours.",
            "Does this package include airport transfers and breakfast?",
            "I'd like to explore some of the lesser-known islands nearby."
        ]
    },
    {
        id: 'public_speaking',
        title: 'Public Speaking',
        emoji: '🎙️',
        systemInstruction: "You are an audience member or a critical panelist at a tech conference. The user is giving a short pitch or talk. Ask challenging but fair questions. Focus on their delivery and clarity.",
        iceBreakers: [
            "I enjoyed your presentation, but could you clarify how this scales?",
            "What do you believe is the most innovative part of your solution?",
            "How does your approach differ from existing industry standards?"
        ],
        personality: 'networking_coach',
        difficulty: 'advanced',
        goals: ['Handle critical questions', 'Maintain projection and confidence', 'Structure short explanations'],
        emotionalTone: 'Critical yet encouraging',
        vocabularyFocus: ['Scalability', 'Innovation', 'Standardization', 'Milestones'],
        practicePhrases: [
            "That's a very insightful question, let me address that.",
            "In terms of scalability, we've designed the architecture to be modular.",
            "I'd like to shift your focus to our primary value proposition.",
            "Could you elaborate on the competitive landscape?",
            "Our ultimate goal is to disrupt the current market paradigm."
        ]
    },
    {
        id: 'networking_event',
        title: 'Networking Event',
        emoji: '🤝',
        systemInstruction: "You are a fellow professional at a high-level networking event. The user is introducing themselves. Engage in professional small talk, ask about their background, and look for 'synergy'.",
        iceBreakers: [
            "What brings you to this event today?",
            "So, what do you do for a living?",
            "Are you working on any exciting projects at the moment?"
        ],
        personality: 'friendly',
        difficulty: 'intermediate',
        goals: ['Pitch yourself effectively', 'Practice active listening', 'Exchange professional info'],
        emotionalTone: 'Charismatic and proactive',
        vocabularyFocus: ['Collaboration', 'Opportunity', 'Network', 'Expertise'],
        practicePhrases: [
            "It's a pleasure to meet you, I've heard a lot about your work.",
            "I'm currently specializing in bridge architecture and urban design.",
            "We should definitely grab a coffee sometime and discuss this further.",
            "What's your take on the recent trends in our industry?",
            "I've found that building a strong network is the key to many successes."
        ]
    }
];

export const VOICES: VoiceConfig[] = [
    { name: VoiceName.Puck, label: 'Puck', gender: 'male', description: 'Clear, Friendly and Approachable', personality: 'friendly' },
    { name: VoiceName.Kore, label: 'Kore', gender: 'female', description: 'Warm, Calm and Nurturing', personality: 'humorous' },
    { name: VoiceName.Fenrir, label: 'Fenrir', gender: 'male', description: 'Deep, Professional and Direct', personality: 'professional' },
    { name: VoiceName.Zephyr, label: 'Zephyr', gender: 'female', description: 'Bright, Energetic and Enthusiastic', personality: 'energetic' },
    { name: VoiceName.Charon, label: 'Charon', gender: 'male', description: 'Authoritative and Strategic', personality: 'networking_coach' },
    { name: VoiceName.Aoede, label: 'Aoede', gender: 'female', description: 'Melodic, Expressive and Soft', personality: 'friendly' },
    { name: VoiceName.Erebus, label: 'Erebus', gender: 'male', description: 'Serious, Gravelly and Precise', personality: 'impatient' },
];

export const DEFAULT_ACHIEVEMENTS = [
    { id: 'first_talk', title: 'Ice Breaker', description: 'Complete your first conversation.', icon: 'Chat', progress: 0 },
    { id: 'streak_3', title: 'Consistent Learner', description: 'Maintain a 3-day streak.', icon: 'Bolt', progress: 33 },
    { id: 'vocab_50', title: 'Word Smith', description: 'Master 50 new words.', icon: 'Book', progress: 10 },
    { id: 'vocab_100', title: 'Lexicon Master', description: 'Master 100 new words.', icon: 'Globe', progress: 5, isMilestone: true },
    { id: 'accent_pro', title: 'Local Soul', description: 'Reach 90% accent match.', icon: 'Star', progress: 0, isMilestone: true },
    { id: 'fluency_master', title: 'Flow State', description: 'Speak for 10 minutes without fillers.', icon: 'Flame', progress: 0, isMilestone: true },
    { id: 'mission_master', title: 'Elite Tutor', description: 'Complete 10 different scenarios.', icon: 'Award', progress: 0, isMilestone: true },
];

export const DEFAULT_GOALS = [
    { id: 'goal_xp', title: 'Daily XP', target: 500, current: 0, type: 'xp' as const },
    { id: 'goal_speak', title: 'Speaking Time', target: 15, current: 0, type: 'speaking_minutes' as const },
    { id: 'goal_week', title: 'Weekly Challenge', target: 60, current: 0, type: 'speaking_minutes' as const },
    { id: 'goal_mimic', title: 'Mimic Drills', target: 10, current: 0, type: 'mimic_attempts' as const },
];

export const PRACTICE_LANGUAGES = [
    { id: 'english', label: 'English', flag: '🇺🇸', instruction: "The conversation MUST be in English. Help the user improve their English fluency and grammar." },
    { id: 'arabic', label: 'Arabic', flag: '🇸🇦', instruction: "The conversation MUST be in Arabic. Help the user improve their Arabic. Speak naturally." },
    { id: 'bangla', label: 'Bangla', flag: '🇧🇩', instruction: "The conversation MUST be in Bangla. Help the user improve their Bangla speaking skills." },
    { id: 'hindi', label: 'Hindi/Urdu', flag: '🇮🇳', instruction: "The conversation MUST be in Hindi or Urdu. Help the user improve their speaking skills." },
    { id: 'russian', label: 'Russian', flag: '🇷🇺', instruction: "The conversation MUST be in Russian. Help the user improve their Russian speaking skills." },
    { id: 'german', label: 'German', flag: '🇩🇪', instruction: "The conversation MUST be in German. Help the user improve their German fluency." },
    { id: 'french', label: 'French', flag: '🇫🇷', instruction: "The conversation MUST be in French. Help the user improve their French speaking skills." },
    { id: 'spanish', label: 'Spanish', flag: '🇪🇸', instruction: "The conversation MUST be in Spanish. Help the user improve their Spanish fluency." },
    { id: 'japanese', label: 'Japanese', flag: '🇯🇵', instruction: "The conversation MUST be in Japanese. Help the user improve their Japanese speaking skills. Use appropriate honorifics." },
    { id: 'chinese', label: 'Mandarin', flag: '🇨🇳', instruction: "The conversation MUST be in Mandarin Chinese. Help the user improve their Mandarin speaking skills. Focus on tones." },
];

export const ACCENTS = [
    { 
        id: 'american', 
        label: 'American', 
        flag: '🇺🇸',
        instruction: "Standard American (GenAm). Use words like 'apartment', 'elevator', 'gas', 'sidewalk'. Use 'like' or 'ya know' occasionally as fillers. Cultural phrasing: 'Hang in there', 'What's the catch?'.",
        slang: ["Awesome", "Cool", "Dude", "For real"],
        fillers: ["Like", "You know", "Uh-huh"],
        rhythm: "Vowel-timed, generally consistent pitch across phrases."
    },
    { 
        id: 'british', 
        label: 'British', 
        flag: '🇬🇧',
        instruction: "Modern RP or Estuary. Use 'flat', 'lift', 'petrol', 'pavement'. Fillers: 'Innit', 'Actually', 'Right'. Cultural phrasing: 'Not my cup of tea', 'Bit of a faff'.",
        slang: ["Brilliant", "Mate", "Knackered", "Chuffed"],
        fillers: ["Actually", "Right", "Sort of"],
        rhythm: "Stress-timed rhythm with pitch variation."
    },
    { 
        id: 'australian', 
        label: 'Australian', 
        flag: '🇦🇺',
        instruction: "Australian English. Use 'arvo', 'barbie', 'thongs'. High Rising Terminal. Cultural phrasing: 'No worries mate', 'Fair dinkum'.",
        slang: ["G'day", "Stoked", "Brekkie", "Chock-a-block"],
        fillers: ["Yeah-no", "True", "Anyway"],
        rhythm: "Up-talk (ending sentences on a higher pitch)."
    },
    { 
        id: 'arabic', 
        label: 'Arabic', 
        flag: '🇸🇦',
        instruction: "Arabic-influenced English. Stronger emphasis on consonants. Cultural phrasing: 'Inshallah', 'Wallah', 'Habibi'.",
        slang: ["Yallah", "Khalas", "Wallah", "Habibi"],
        fillers: ["Actually", "You know", "I mean"],
        rhythm: "Slightly more staccato rhythm."
    },
    { 
        id: 'japanese', 
        label: 'Japanese', 
        flag: '🇯🇵',
        instruction: "Japanese-influenced English. Pure vowels, avoids consonant clusters. Cultural phrasing: 'I'll do my best', 'I see'.",
        slang: ["Majide", "Yatta", "Sugoi", "Abunai"],
        fillers: ["Etto", "Ano", "So"],
        rhythm: "Mora-timed rhythm influence."
    },
    { 
        id: 'hispanic', 
        label: 'Hispanic', 
        flag: '🇲🇽',
        instruction: "Latin American/Spanish-influenced English. Syllable-timed rhythm. Frequent use of 'no?' at the end of sentences. Cultural phrasing: 'How you say...', 'For real'.",
        slang: ["Amigo", "Fiesta", "Bueno", "De nada"],
        fillers: ["Este", "Mira", "Osea"],
        rhythm: "Syllable-timed, very rhythmic and energetic."
    },
    { 
        id: 'chinese', 
        label: 'Chinese', 
        flag: '🇨🇳',
        instruction: "Mandarin-influenced English. Might omit some articles. Focus on clear tones. Cultural phrasing: 'Long time no see', 'Eat already?'.",
        slang: ["Jiayou", "Walao", "Kiasu", "Steady"],
        fillers: ["Nei ge", "Hao", "Eh"],
        rhythm: "Tonal influence leads to distinct pitch drops and rises."
    },
    { 
        id: 'indian', 
        label: 'Indian', 
        flag: '🇮🇳',
        instruction: "Indian English (Hinglish influence). Retroflex consonants (t/d sounds). Use of 'only' for emphasis. Cultural phrasing: 'Doing the needful', 'Actually itself'.",
        slang: ["Jugaad", "Arre", "Bindaas", "Yaar"],
        fillers: ["Na", "Accha", "Basically"],
        rhythm: "Slightly bouncy, syllable-timed rhythm."
    },
];

export const API_KEY_ERROR = "API Key not found. Please ensure your Gemini API Key is set in Settings.";

export const SPEAK_LIKE_STYLES: SpeakLikeStyle[] = [
    {
        id: 'startup_founder',
        label: 'Startup Founder',
        emoji: '🦄',
        description: 'Vibrant, visionary, and fast-paced.',
        instruction: "Speak like a visionary startup founder. Use tech-forward language, prioritize 'impact', 'scale', and 'disruption'. Be high-energy and persuasive.",
        targetTraits: ['Persuasion', 'Confidence', 'Visionary Tone'],
        typicalVocabulary: ['Leverage', 'Synergy', 'Pivot', 'Bandwidth', 'Game-changer']
    },
    {
        id: 'ted_speaker',
        label: 'TED Speaker',
        emoji: '🎤',
        description: 'Intellectual, narrative-driven, and profound.',
        instruction: "Use strategic pauses, emphasize key words for emotional impact, and use vivid story-telling language. Ask rhetorical questions.",
        targetTraits: ['Storytelling', 'Pacing', 'Emotional Resonance'],
        typicalVocabulary: ['Remarkable', 'Imagine', 'Perspective', 'Fundamental', 'Journey']
    },
    {
        id: 'podcast_host',
        label: 'Podcast Host',
        emoji: '🎙️',
        description: 'Warm, engaging, and conversational.',
        instruction: "Be very expressive. Use high-energy openers. Use fillers like 'Yeah, absolutely' or 'That is wild' to show active listening.",
        targetTraits: ['Engagement', 'Vocal Variety', 'Active Listening'],
        typicalVocabulary: ['Absolutely', 'Insightful', 'Dive deep', 'Takeaway', 'Shoutout']
    }
];
