// Voice Service - Text-to-Speech using Gemini TTS
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const TTS_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`;

// Voice configuration - Female voices for counseling
export const AVAILABLE_VOICES = {
  aoede: { name: 'Aoede', description: 'Warm, empathetic female voice' },
  puck: { name: 'Puck', description: 'Friendly, approachable female voice' },
  charon: { name: 'Charon', description: 'Calm, soothing female voice' },
  kore: { name: 'Kore', description: 'Clear, professional female voice' },
  fenrir: { name: 'Fenrir', description: 'Gentle, caring female voice' },
} as const;

export type VoiceName = keyof typeof AVAILABLE_VOICES;

// Default to Aoede (warm, empathetic)
let selectedVoice: VoiceName = 'aoede';
let isVoiceEnabled = true;
let currentAudio: HTMLAudioElement | null = null;
let onPlayCallback: (() => void) | null = null;
let onEndCallback: (() => void) | null = null;

export const voiceService = {
  /**
   * Set callback for when audio actually starts playing
   */
  onPlay(callback: () => void): void {
    onPlayCallback = callback;
  },

  /**
   * Set callback for when audio ends
   */
  onEnd(callback: () => void): void {
    onEndCallback = callback;
  },

  /**
   * Convert text to speech and play it
   */
  async speak(text: string): Promise<void> {
    if (!isVoiceEnabled) {
      console.log('[Voice] Voice disabled');
      return;
    }

    if (!API_KEY) {
      console.warn('[Voice] API key missing, using browser TTS fallback');
      this.speakWithBrowserTTS(text);
      return;
    }

    try {
      console.log(`[Voice] 🎙️ Speaking with ${AVAILABLE_VOICES[selectedVoice].name}:`, text.substring(0, 50) + '...');

      // Stop any currently playing audio
      this.stop();

      const response = await fetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: text  // Direct text, no prompt prefix for faster generation
            }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: AVAILABLE_VOICES[selectedVoice].name
                }
              }
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Voice] ❌ TTS API error:', response.status, errorText);
        console.log('[Voice] Falling back to browser TTS');
        this.speakWithBrowserTTS(text);
        return;
      }

      const data = await response.json();
      const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!audioData) {
        console.error('[Voice] ❌ No audio data in response');
        console.log('[Voice] Falling back to browser TTS');
        this.speakWithBrowserTTS(text);
        return;
      }

      // Convert base64 to audio and play immediately
      const audioBlob = this.base64ToBlob(audioData, 'audio/wav');
      const audioUrl = URL.createObjectURL(audioBlob);
      
      currentAudio = new Audio(audioUrl);
      currentAudio.preload = 'auto';
      
      // Callback when audio actually starts playing
      currentAudio.onplay = () => {
        console.log('[Voice] ✅ Audio started playing');
        if (onPlayCallback) onPlayCallback();
      };
      
      currentAudio.onended = () => {
        console.log('[Voice] ✅ Audio finished');
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        if (onEndCallback) onEndCallback();
      };
      
      currentAudio.onerror = (e) => {
        console.error('[Voice] ❌ Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        if (onEndCallback) onEndCallback();
      };
      
      // Start playing
      console.log('[Voice] 🎵 Starting audio playback...');
      await currentAudio.play();
      console.log('[Voice] ✅ Audio play() called successfully');

    } catch (error: any) {
      console.error('[Voice] ❌ Error generating speech:', error);
      console.log('[Voice] Falling back to browser TTS');
      this.speakWithBrowserTTS(text);
    }
  },

  /**
   * Fallback to browser Text-to-Speech
   */
  speakWithBrowserTTS(text: string): void {
    if (!('speechSynthesis' in window)) {
      console.error('[Voice] Browser TTS not supported');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a female voice
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Karen')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('[Voice] Using browser voice:', femaleVoice.name);
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      
      utterance.onstart = () => {
        console.log('[Voice] ✅ Browser TTS started');
        if (onPlayCallback) onPlayCallback();
      };
      
      utterance.onend = () => {
        console.log('[Voice] ✅ Browser TTS finished');
        if (onEndCallback) onEndCallback();
      };
      
      utterance.onerror = (e) => {
        console.error('[Voice] ❌ Browser TTS error:', e);
        if (onEndCallback) onEndCallback();
      };
      
      window.speechSynthesis.speak(utterance);
      console.log('[Voice] 🔊 Browser TTS queued');
    } catch (error) {
      console.error('[Voice] Browser TTS error:', error);
    }
  },

  /**
   * Stop currently playing audio
   */
  stop(): void {
    // Stop Gemini TTS audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
      console.log('[Voice] Gemini TTS stopped');
    }
    
    // Stop browser TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      console.log('[Voice] Browser TTS stopped');
    }
  },

  /**
   * Set the voice to use
   */
  setVoice(voice: VoiceName): void {
    selectedVoice = voice;
    console.log(`[Voice] Voice changed to: ${AVAILABLE_VOICES[voice].name}`);
  },

  /**
   * Get current voice
   */
  getVoice(): VoiceName {
    return selectedVoice;
  },

  /**
   * Enable/disable voice
   */
  setEnabled(enabled: boolean): void {
    isVoiceEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
    console.log(`[Voice] Voice ${enabled ? 'enabled' : 'disabled'}`);
  },

  /**
   * Check if voice is enabled
   */
  isEnabled(): boolean {
    return isVoiceEnabled;
  },

  /**
   * Check if voice is currently playing
   */
  isPlaying(): boolean {
    return currentAudio !== null && !currentAudio.paused;
  },

  /**
   * Convert base64 to Blob
   */
  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
};
