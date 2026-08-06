<div align="center">

# 🎙️ English AI Speaking Coach

**Real-Time Multimodal Voice & Pronunciation Coach**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Google AI Studio](https://img.shields.io/badge/Google_AI_Studio-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-FF4081?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

An interactive, web-based speech fluency coach powered by **Google AI Studio Multimodal APIs**. Practice conversational English with zero latency, receive instant phonetic pronunciation feedback, track speech pace (WPM), and refine your accent in real time.

</div>

---

## 🌟 Key Features

- 🔊 **Real-Time Voice Streaming**: Bi-directional PCM audio stream over WebSockets for natural, low-latency spoken conversations.
- 🎯 **Pronunciation & Accent Coaching**: Identifies mispronounced words and provides immediate IPA phonetic breakdowns.
- 📝 **Live Synchronized Transcripts**: Real-time text transcription of both user audio input and AI spoken responses.
- 📈 **Performance Analytics**: Visual dashboard tracking Words Per Minute (WPM), grammar accuracy, and vocabulary richness over time.
- 🎭 **Custom Scenario Roleplay**: Practice job interviews, casual conversations, public speaking, or business negotiations.

---

## 🏗️ Architecture & File Structure

```
english-ai-speaking-coach/
├── src/
│   ├── components/
│   │   ├── CoachSession.tsx         # Primary conversational UI & dynamic visualizer
│   │   ├── AudioVisualizer.tsx      # Real-time Web Audio API frequency waveform
│   │   ├── LiveTranscript.tsx       # Dual-stream speech transcript pane
│   │   └── AnalyticsDashboard.tsx   # WPM, fluency, and vocabulary metrics chart
│   ├── hooks/
│   │   ├── useAudioRecorder.ts      # Browser audio capture & 16kHz PCM encoder
│   │   └── useAudioPlayer.ts        # Audio context queue for streaming AI speech
│   ├── services/
│   │   └── aiCoach.ts               # Gemini API WebSocket / REST voice endpoint wrapper
│   ├── types/
│   │   └── speech.ts                # Audio buffer, transcript, & score types
│   ├── App.tsx                      # Root application layout
│   └── index.css                    # UI styles & dark mode theme tokens
├── public/                          # Sound samples & static branding assets
├── package.json
└── vite.config.ts
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Audio Processing**: Web Audio API, AudioWorklet, MediaRecorder API
- **AI Core**: Google AI Studio Multimodal WebSocket API (Gemini Live)
- **State Management**: React Hooks & Context API

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Gemini API Key with Multimodal Audio streaming access ([Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone Repo**
   ```bash
   git clone https://github.com/nurfarhad/english-ai-speaking-coach.git
   cd english-ai-speaking-coach
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create `.env.local`:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start Application**
   ```bash
   npm run dev
   ```

---

## 📜 License

MIT License © [Nur Farhad](https://github.com/nurfarhad)
