import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/SectionHeader";
import { Calendar, Video, Phone, Mic, Square, Volume2, VolumeX, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { counselingService } from "@/services/counselingService";
import { geminiService } from "@/services/geminiService";
import { voiceService, AVAILABLE_VOICES, type VoiceName } from "@/services/voiceService";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Counseling = () => {
  const { userRecord } = useAuth();
  const [activeTab, setActiveTab] = useState<"professional" | "ai">("professional");
  const [isRecording, setIsRecording] = useState(false);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('aoede');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    loadTherapists();
    // Initialize Gemini TTS voice service
    voiceService.setVoice(selectedVoice);
    voiceService.setEnabled(voiceEnabled);
    
    // Set up voice callbacks
    voiceService.onPlay(() => {
      console.log('[Counseling] Voice actually started playing');
      setIsGeneratingVoice(false);
      setIsSpeaking(true);
    });
    
    voiceService.onEnd(() => {
      console.log('[Counseling] Voice finished playing');
      setIsSpeaking(false);
      setIsGeneratingVoice(false);
    });
    
    // Initialize speech synthesis (fallback)
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event: any) => {
        const speechText = event.results[0][0].transcript;
        handleUserSpeech(speechText);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsRecording(false);
        if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error('Voice recognition error. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isRecording) {
          // Restart if still in recording mode
          setTimeout(() => {
            if (recognitionRef.current && isRecording) {
              recognitionRef.current.start();
              setIsListening(true);
            }
          }, 100);
        }
      };
    }
  }, []);

  const loadTherapists = async () => {
    try {
      const therapistsData = await counselingService.getTherapists();
      setTherapists(therapistsData);
    } catch (error) {
      console.error('Error loading therapists:', error);
      toast.error('Failed to load therapists');
    }
  };

  const handleBookSession = async (therapistId: string, type: 'video' | 'phone') => {
    if (!userRecord?.id) {
      toast.error('Please sign in to book a session');
      return;
    }

    setLoading(true);
    try {
      await counselingService.bookSession({
        user_id: userRecord.id,
        therapist_id: therapistId,
        type: 'professional',
        status: 'scheduled',
        scheduled_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        duration_minutes: 60
      });
      toast.success('Session booked successfully! You will receive a confirmation email.');
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSpeech = async (speechText: string) => {
    if (!speechText.trim()) return;

    setTranscript(prev => [...prev, { role: 'user', text: speechText }]);
    setIsListening(false);
    setIsRecording(false);
    setLoading(true);

    try {
      const response = await geminiService.sendMessage(speechText);
      setTranscript(prev => [...prev, { role: 'assistant', text: response.response }]);
      
      // Speak the response using Gemini TTS (parallel, non-blocking)
      if (voiceEnabled) {
        setIsGeneratingVoice(true);
        console.log('[Counseling] 🚀 Generating voice audio...');
        
        // Start voice generation (callbacks will update state when actually playing)
        voiceService.speak(response.response)
          .catch((error) => {
            console.error('[Counseling] Voice error:', error);
            setIsSpeaking(false);
            setIsGeneratingVoice(false);
            toast.error('Voice playback failed');
          });
      }
      
      // Don't wait for voice, continue immediately
      setLoading(false);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get response from AI counselor');
      setIsSpeaking(false);
      setIsGeneratingVoice(false);
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) {
      toast.error('Text-to-speech not supported in your browser.');
      return;
    }

    // Stop any ongoing speech
    synthRef.current.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error('Speech synthesis error.');
    };

    synthRef.current.speak(utterance);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
    } else {
      // Start recording
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setIsListening(true);
        toast.success('Listening... Speak now!');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast.error('Failed to start voice recognition.');
      }
    }
  };

  const stopSpeaking = () => {
    voiceService.stop();
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleVoice = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    voiceService.setEnabled(newState);
    toast.success(newState ? 'Voice enabled' : 'Voice disabled');
  };

  const handleVoiceChange = (voice: VoiceName) => {
    setSelectedVoice(voice);
    voiceService.setVoice(voice);
    toast.success(`Voice changed to ${AVAILABLE_VOICES[voice].name}`);
  };

  const clearTranscript = () => {
    setTranscript([]);
    geminiService.resetConversation();
    toast.success('Conversation cleared');
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <div className="max-w-container mx-auto px-6 py-12">
        <SectionHeader
          label="Professional Support"
          title="Talk to a Counselor"
          description="Connect with licensed therapists or try our AI-powered voice counselor"
        />

        {/* Tabs */}
        <div className="flex gap-0 border-2 border-border mb-0">
          <button
            onClick={() => setActiveTab("professional")}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === "professional"
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            Book a Professional
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-1 px-6 py-4 font-medium transition-colors border-l-2 border-border ${
              activeTab === "ai"
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-muted-foreground hover:bg-muted"
            }`}
          >
            AI Counselor (Voice)
          </button>
        </div>

        {/* Professional Booking */}
        {activeTab === "professional" && (
          <div className="border-2 border-t-0 border-border bg-background p-8">
            <div className="space-y-0 divide-y-2 divide-border">
              {therapists.map((therapist, index) => (
                <div key={index} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {therapist.name}
                      </h3>
                      <p className="text-sm text-secondary mb-2">{therapist.specialty}</p>
                      <p className="text-sm text-muted-foreground mb-1">{therapist.credentials}</p>
                      <p className="text-sm text-foreground">{therapist.availability}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBookSession(therapist.id, 'video')}
                        disabled={loading}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Video Call
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBookSession(therapist.id, 'phone')}
                        disabled={loading}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Phone Call
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleBookSession(therapist.id, 'video')}
                        disabled={loading}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Voice Counselor */}
        {activeTab === "ai" && (
          <div className="border-2 border-t-0 border-border bg-background p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  AI Voice Counselor
                </h3>
                <p className="text-muted-foreground">
                  Have a natural conversation with our AI counselor. Your session is private and
                  uses evidence-based therapeutic techniques.
                </p>
              </div>

              {/* Voice Settings */}
              <div className="flex justify-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVoice}
                  className="flex items-center gap-2"
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  {voiceEnabled ? 'Voice On' : 'Voice Off'}
                </Button>

                <Select value={selectedVoice} onValueChange={(value) => handleVoiceChange(value as VoiceName)}>
                  <SelectTrigger className="w-[200px]">
                    <Settings className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AVAILABLE_VOICES).map(([key, voice]) => (
                      <SelectItem key={key} value={key}>
                        {voice.name} - {voice.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearTranscript}
                  disabled={transcript.length === 0}
                >
                  Clear Chat
                </Button>
              </div>

              {/* Voice Control */}
              <div className="bg-surface border-2 border-border p-12 mb-6">
                <button
                  onClick={toggleRecording}
                  disabled={loading}
                  className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg ${
                    isRecording
                      ? "bg-destructive hover:bg-destructive/90 animate-pulse"
                      : "bg-primary hover:bg-primary/90 hover:scale-105"
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-12 h-12 text-primary-foreground" />
                  ) : (
                    <Mic className="w-12 h-12 text-primary-foreground" />
                  )}
                </button>
                <div className="mt-6">
                  {loading && !isSpeaking && !isGeneratingVoice ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium text-primary">
                        AI is thinking...
                      </p>
                    </div>
                  ) : isGeneratingVoice && !isSpeaking ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium text-primary">
                        Preparing voice...
                      </p>
                    </div>
                  ) : isSpeaking ? (
                    <div className="flex items-center justify-center gap-2">
                      <Volume2 className="w-5 h-5 text-primary animate-pulse" />
                      <p className="text-sm font-medium text-primary">
                        🔊 Speaking... ({AVAILABLE_VOICES[selectedVoice].name})
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isListening ? "🎤 Listening... Speak now" : isRecording ? "⏳ Processing..." : "Click microphone to start"}
                    </p>
                  )}
                  {voiceEnabled && !isSpeaking && !loading && !isGeneratingVoice && (
                    <p className="text-xs text-primary mt-2">
                      🎙️ Voice: {AVAILABLE_VOICES[selectedVoice].name}
                    </p>
                  )}
                </div>

                {isSpeaking && (
                  <div className="mt-4 space-y-3">
                    {/* Speaking Animation */}
                    <div className="flex justify-center gap-1">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-primary rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 20 + 10}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.8s'
                          }}
                        />
                      ))}
                    </div>
                    <Button
                      onClick={stopSpeaking}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 mx-auto"
                    >
                      <VolumeX className="w-4 h-4" />
                      Stop Speaking
                    </Button>
                  </div>
                )}

                {(isRecording || isListening) && (
                  <div className="mt-6 flex justify-center gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary animate-pulse"
                        style={{
                          height: `${Math.random() * 40 + 20}px`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Transcript */}
              <div className="bg-surface border-2 border-border p-6 max-h-96 overflow-y-auto rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Transcript
                  </h4>
                  {transcript.length > 0 && (
                    <button
                      onClick={clearTranscript}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-3 text-sm">
                  {transcript.length === 0 ? (
                    <div className="text-center text-muted-foreground space-y-3">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Mic className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-medium">Ready to talk?</p>
                      <p className="text-sm">Click the microphone button above and start speaking</p>
                      <p className="text-xs text-primary">Your conversation is private and confidential</p>
                    </div>
                  ) : (
                    transcript.map((entry, index) => (
                      <p key={index} className="text-muted-foreground">
                        <span className={`font-semibold ${
                          entry.role === 'user' ? 'text-foreground' : 'text-secondary'
                        }`}>
                          {entry.role === 'user' ? 'You:' : 'AI Counselor:'}
                        </span>{' '}
                        {entry.text}
                      </p>
                    ))
                  )}
                </div>
              </div>
              
              {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari for the best experience.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Counseling;
