import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToUint8Array, createWavBlob } from '../utils/audioUtils';

interface LiveClientConfig {
  apiKey: string;
  systemInstruction: string;
  voiceName: string;
  onOpen: () => void;
  onClose: () => void;
  onError: (error: Error) => void;
  onVolumeChange: (volume: number) => void;
  onTranscript: (speaker: 'user' | 'model', text: string, isStreaming?: boolean) => void;
  onAudioData?: (speaker: 'user' | 'model', audioBlob: globalThis.Blob) => void;
  onUserSpeaking?: (isSpeaking: boolean) => void;
}

export class LiveClient {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private session: any = null; // Holds the active session
  private config: LiveClientConfig;
  private isConnected = false;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private analyzer: AnalyserNode | null = null;
  private userAnalyzer: AnalyserNode | null = null;
  private isUserSpeaking = false;
  private animationFrameId: number | null = null;
  
  // Audio capture for turns
  private modelAudioChunks: Uint8Array[] = [];
  private userAudioChunks: Uint8Array[] = [];

  constructor(config: LiveClientConfig) {
    this.config = config;
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
  }

  async connect() {
    try {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Ensure input context is running (critical for mobile browsers)
      if (this.inputAudioContext.state === 'suspended') {
        await this.inputAudioContext.resume();
      }
      
      this.analyzer = this.outputAudioContext.createAnalyser();
      this.analyzer.fftSize = 256;
      this.analyzer.connect(this.outputAudioContext.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaStream = stream;

      this.userAnalyzer = this.inputAudioContext.createAnalyser();
      this.userAnalyzer.fftSize = 256;
      const userSource = this.inputAudioContext.createMediaStreamSource(stream);
      userSource.connect(this.userAnalyzer);

      const sessionPromise = this.ai.live.connect({
        model: 'gemini-2.0-flash-live-001',
        callbacks: {
          onopen: async () => {
            console.log('Live API Connected');
            this.isConnected = true;
            if (this.inputAudioContext && this.inputAudioContext.state === 'suspended') {
              await this.inputAudioContext.resume();
            }
            if (this.outputAudioContext && this.outputAudioContext.state === 'suspended') {
              await this.outputAudioContext.resume();
            }
            this.config.onOpen();
            this.startAudioInputStream(sessionPromise);
            this.monitorUserSpeaking();
          },
          onmessage: async (message: LiveServerMessage) => {
            await this.handleMessage(message);
          },
          onclose: (e: any) => {
            console.log('Live API Closed', e);
            this.isConnected = false;
            this.config.onClose();
          },
          onerror: (e: any) => {
            console.error('Live API Error', e);
            this.config.onError(new Error(e.message || 'Network error or model not found'));
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: this.config.voiceName } },
          },
          systemInstruction: this.config.systemInstruction,
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
        },
      });
      
      this.session = sessionPromise;

    } catch (error: any) {
      console.error('Connection failed:', error);
      let userFriendlyError = error.message;
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        userFriendlyError = 'No microphone was found. Please ensure a microphone is connected and try again.';
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        userFriendlyError = 'Microphone permission was denied. Please allow microphone access to use the AI tutor.';
      }
      this.config.onError(new Error(userFriendlyError));
    }
  }

  setMute(muted: boolean) {
    if (this.mediaStream) {
        this.mediaStream.getAudioTracks().forEach(track => {
            track.enabled = !muted;
        });
    }
  }

  private startAudioInputStream(sessionPromise: Promise<any>) {
    if (!this.inputAudioContext || !this.mediaStream) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
      if (!this.isConnected) return;
      
      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
      
      // Store for local replay
      const l = inputData.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      this.userAudioChunks.push(new Uint8Array(int16.buffer));

      const pcmBlob = createPcmBlob(inputData);

      sessionPromise.then((session) => {
        if (typeof session.send === 'function') {
           session.send({ 
             realtimeInput: {
               mediaChunks: [pcmBlob]
             }
           });
        } else if (typeof session.sendRealtimeInput === 'function') {
           session.sendRealtimeInput({ audio: pcmBlob });
        }
      }).catch(err => {
        console.error("Failed to send audio chunk", err);
      });
    };

    this.inputSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private monitorUserSpeaking() {
    if (!this.userAnalyzer) return;

    const bufferLength = this.userAnalyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const check = () => {
      if (!this.isConnected) return;
      this.userAnalyzer!.getByteFrequencyData(dataArray);
      let sum = 0;
      for(let i=0; i<bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      const speaking = avg > 20; // Threshold for speaking
      
      if (speaking !== this.isUserSpeaking) {
        this.isUserSpeaking = speaking;
        if (this.config.onUserSpeaking) {
          this.config.onUserSpeaking(speaking);
        }
        
        // If stopped speaking, emit the turn audio
        if (!speaking && this.userAudioChunks.length > 0) {
            if (this.config.onAudioData) {
                const blob = createWavBlob(this.userAudioChunks, 16000); // User is 16kHz
                this.config.onAudioData('user', blob);
            }
            this.userAudioChunks = [];
        }
      }
      
      // Update volume for user visualizer if needed
      if (speaking) {
         this.config.onVolumeChange(Math.min(avg / 100, 1));
      } else if (!this.sources.size) {
         // Only set to 0 if model is not speaking either
         this.config.onVolumeChange(0);
      }

      if (this.isConnected) {
        this.animationFrameId = requestAnimationFrame(check);
      }
    };
    check();
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle Transcriptions
    // When modality is AUDIO, model text comes in outputTranscription, not modelTurn parts
    if (message.serverContent?.outputTranscription?.text) {
        this.config.onTranscript('model', message.serverContent.outputTranscription.text);
    }

    // Input transcription
    if (message.serverContent?.inputTranscription?.text) {
         this.config.onTranscript('user', message.serverContent.inputTranscription.text);
    }

    if (!this.outputAudioContext || !this.analyzer) return;

    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
        const audioData = base64ToUint8Array(base64Audio);
        this.modelAudioChunks.push(audioData);
        
        // Ensure context is running (mobile browsers sometimes suspend it)
        if(this.outputAudioContext.state === 'suspended') {
            await this.outputAudioContext.resume();
        }

        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        
        const audioBuffer = await decodeAudioData(
            audioData,
            this.outputAudioContext,
            24000,
            1
        );

        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Connect through gainNode to analyzer (analyzer is already connected to destination)
        const gainNode = this.outputAudioContext.createGain();
        source.connect(gainNode);
        gainNode.connect(this.analyzer);

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        
        source.addEventListener('ended', () => {
            this.sources.delete(source);
            if (this.sources.size === 0) {
               // When model stops speaking, emit the accumulated audio
               if (this.modelAudioChunks.length > 0 && this.config.onAudioData) {
                  const blob = createWavBlob(this.modelAudioChunks, 24000);
                  this.config.onAudioData('model', blob);
                  this.modelAudioChunks = [];
               }
               if (!this.isUserSpeaking) {
                  this.config.onVolumeChange(0);
               }
            }
        });
        this.sources.add(source);

        // Simple volume estimation for visualizer based on buffer data
        const channelData = audioBuffer.getChannelData(0);
        let sum = 0;
        // Sample a few points for efficiency
        for(let i=0; i<channelData.length; i+=100) {
             sum += Math.abs(channelData[i]);
        }
        const avg = sum / (channelData.length / 100);
        if (!this.isUserSpeaking) {
           this.config.onVolumeChange(Math.min(avg * 5, 1)); // Scale up a bit
        }
    }

    const interrupted = message.serverContent?.interrupted;
    if (interrupted) {
      console.log('Model interrupted');
      this.sources.forEach((source) => {
        source.stop();
        this.sources.delete(source);
      });
      this.nextStartTime = 0;
      if (!this.isUserSpeaking) {
         this.config.onVolumeChange(0);
      }
    }
  }

  async disconnect() {
    this.isConnected = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (this.session) {
      const s = await this.session;
      if(s && typeof s.close === 'function') {
          s.close();
      }
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    if (this.inputSource) this.inputSource.disconnect();
    if (this.scriptProcessor) this.scriptProcessor.disconnect();
    
    if (this.inputAudioContext) await this.inputAudioContext.close();
    if (this.outputAudioContext) await this.outputAudioContext.close();
    
    this.sources.forEach(s => s.stop());
    this.sources.clear();
  }
}