import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, ExternalLink, FileText } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useAuth } from "@/contexts/AuthContext";
import { chatService } from "@/services/chatService";
import { geminiService } from "@/services/geminiService";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: number[];
}

const Chatbot = () => {
  const { userRecord } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm here to provide evidence-based mental health support. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Only scroll on new messages, not on initial load
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (userRecord?.id) {
      loadChatHistory();
      loadSources();
    }
  }, [userRecord]);

  const loadChatHistory = async () => {
    if (!userRecord?.id) return;
    try {
      const history = await chatService.getChatHistory(userRecord.id);
      if (history.length > 0) {
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const loadSources = async () => {
    try {
      const allSources = await chatService.getAllCitationSources();
      setSources(allSources);
    } catch (error) {
      console.error('Error loading sources:', error);
    }
  };

  // Static research resources from chatbot_data_source
  const staticResources = [
    {
      id: 'mental-health-book',
      title: 'Mental Health Book',
      description: 'Comprehensive guide to mental health and wellbeing',
      url: '/docs/Mental_Health_Book.pdf'
    },
    {
      id: 'who-action-plan',
      title: 'WHO Mental Health Action Plan 2013-2030',
      description: 'Comprehensive mental health action plan by World Health Organization',
      url: '/docs/Comprehensive_mental_health_action_plan2013-2030.pdf'
    }
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const newMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      if (userRecord?.id) {
        try {
          await chatService.saveChatMessage({
            user_id: userRecord.id,
            role: "user",
            content: input
          });
        } catch (dbError) {
          console.warn('Failed to save message to database:', dbError);
        }
      }

      const aiResult = await geminiService.sendMessage(input);

      const aiResponse = {
        role: "assistant" as const,
        content: aiResult.response,
        citations: aiResult.citations,
      };
      
      setMessages((prev) => [...prev, aiResponse]);

      if (userRecord?.id) {
        try {
          await chatService.saveChatMessage({
            user_id: userRecord.id,
            role: "assistant",
            content: aiResponse.content,
            citations: aiResponse.citations
          });
        } catch (error) {
          console.error('Error saving AI response:', error);
        }
      }

      setLoading(false);
    } catch (error: any) {
      console.error('Error in handleSend:', error);
      
      const errorMessage = {
        role: "assistant" as const,
        content: `Error: ${error.message || 'Failed to get response'}\n\nPlease check:\n1. Your API key is correct in .env\n2. Internet connection is stable\n3. Browser console (F12) for details`,
        citations: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast.error('Failed to send message - check console for details');
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SectionHeader
          label="AI Assistant"
          title="Evidence-Based Chat Support"
          description="Get mental health guidance backed by research and clinical evidence"
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
          {/* Sources Sidebar */}
          <div className="bg-surface border-2 border-border rounded-lg overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b-2 border-border bg-background">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Research Sources</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 cb-scroll">
              {/* Static Research Resources */}
              <div className="space-y-3 mb-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Knowledge Base</h4>
                {staticResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-background border border-border rounded hover:bg-muted hover:border-primary transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">{resource.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{resource.description}</p>
                        <span className="text-xs text-secondary inline-flex items-center gap-1">
                          View PDF <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Dynamic Citation Sources */}
              {sources.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cited Sources</h4>
                  {sources.map((source) => (
                    <div key={source.id} className="p-3 bg-background border border-border rounded hover:bg-muted transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground text-xs font-bold rounded flex items-center justify-center">
                          {source.id}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium mb-1 line-clamp-2">{source.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{source.author}</p>
                          <a
                            href={source.url}
                            className="text-xs text-secondary hover:underline inline-flex items-center gap-1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View source <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="bg-surface border-2 border-border rounded-lg overflow-hidden h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/30 flex gap-1 flex-wrap">
                        <span className="text-xs opacity-70">Sources:</span>
                        {message.citations.map((citation) => (
                          <span
                            key={citation}
                            className="inline-flex items-center justify-center w-5 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded"
                          >
                            {citation}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t-2 border-border p-4 bg-background">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={loading}
                />
                <Button 
                  onClick={handleSend} 
                  size="icon" 
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
w                💡 This AI provides information, not medical advice. In crisis, call emergency services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
