import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionHeader from "@/components/SectionHeader";
import { Send, Flag, Loader2, Lock, Shield, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { communityService } from "@/services/communityService";
import { toast } from "sonner";

interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string;
  flagged?: boolean;
}

const Community = () => {
  const { userRecord } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [messageInput, setMessageInput] = useState("");
  const [anonymousUsername, setAnonymousUsername] = useState("");
  const [channels, setChannels] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    loadChannels();
    // Generate anonymous username
    const username = communityService.generateAnonymousUsername();
    setAnonymousUsername(username);
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages();
      
      // Subscribe to real-time updates
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      
      subscriptionRef.current = communityService.subscribeToChannel(
        selectedChannel,
        (newMessage) => {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      );
    }
    
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [selectedChannel]);

  const loadChannels = async () => {
    try {
      const channelsData = await communityService.getChannels();
      setChannels(channelsData);
      if (channelsData.length > 0) {
        const exists = channelsData.some(c => c.id === selectedChannel);
        if (!exists) {
          setSelectedChannel(channelsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading channels:', error);
      toast.error('Failed to load channels');
    }
  };

  const loadMessages = async () => {
    if (!selectedChannel) return;
    
    setLoadingMessages(true);
    try {
      const messagesData = await communityService.getChannelMessages(selectedChannel);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Only scroll to bottom when first loading messages, not on new posts
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Only auto-scroll when loading initial messages
    if (messages.length > 0 && loadingMessages) {
      setTimeout(scrollToBottom, 100);
    }
  }, [loadingMessages]);



  // Generate a valid UUID v4
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleSend = async () => {
    if (!messageInput.trim() || loading) return;

    setLoading(true);
    const tempMessage = messageInput;
    setMessageInput(""); // Clear input immediately for better UX
    
    try {
      // Use anonymous user ID if not authenticated (must be valid UUID)
      const userId = userRecord?.id || generateUUID();
      
      await communityService.postMessage({
        user_id: userId,
        channel_id: selectedChannel,
        content: tempMessage,
        anonymous_username: anonymousUsername
      });
      
      toast.success('Message posted!');
      // Message will appear via real-time subscription
    } catch (error: any) {
      console.error('Error posting message:', error);
      toast.error(error.message || 'Failed to post message');
      setMessageInput(tempMessage); // Restore message on error
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = async (messageId: string) => {
    try {
      await communityService.flagMessage(messageId);
      toast.success('Message flagged for review');
      await loadMessages();
    } catch (error) {
      console.error('Error flagging message:', error);
      toast.error('Failed to flag message');
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col">
      <div className="w-full px-6 pt-8 pb-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            label="Peer Support"
            title="Community Space"
            description="Connect anonymously with others who understand"
          />
        </div>
      </div>
      
      <div className="w-full px-6 pb-8 flex-1 min-h-0">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0 border-2 border-border rounded-lg overflow-hidden shadow-lg h-full w-full">
          {/* Channel List */}
          <div className="bg-surface border-r-2 border-border overflow-y-auto cb-scroll min-h-0">
            <div className="p-4 border-b-2 border-border bg-background sticky top-0 z-10">
              <h3 className="font-semibold text-foreground uppercase text-xs tracking-wider">Channels</h3>
            </div>
            <div>
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full p-4 text-left border-b border-border transition-all duration-200 ${
                    selectedChannel === channel.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground hover:bg-muted hover:translate-x-1"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium capitalize">#{channel.name}</div>
                    {selectedChannel === channel.id && (
                      <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div
                    className={`text-xs ${
                      selectedChannel === channel.id ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {channel.member_count} members
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-col bg-background min-h-0">
            {/* Channel Header */}
            <div className="p-4 border-b-2 border-border bg-gradient-to-r from-surface to-background flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-foreground capitalize text-lg">
                  #{channels.find((c) => c.id === selectedChannel)?.name || 'Select a channel'}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Anonymous</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Moderated</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>Safe Space</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 space-y-3 cb-scroll"
              style={{ scrollbarGutter: 'stable' }}
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-muted-foreground mb-2">No messages yet</p>
                    <p className="text-sm text-muted-foreground">Be the first to start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                <div 
                  key={message.id} 
                  className="group hover:bg-muted/50 p-3 rounded-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {message.anonymous_username.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">
                          {message.anonymous_username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {message.flagged && (
                          <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">Flagged</span>
                        )}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed break-words">{message.content}</p>
                    </div>
                    <button 
                      onClick={() => handleFlag(message.id)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      disabled={message.flagged}
                      title="Flag inappropriate content"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t-2 border-border p-4 bg-background flex-shrink-0">
              <div className="flex gap-2 mb-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Share your thoughts... (Shift+Enter for new line)"
                  className="flex-1"
                  disabled={loading}
                />
                <Button 
                  onClick={handleSend} 
                  size="icon"
                  disabled={loading || !messageInput.trim()}
                  className="shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs text-muted-foreground">
                    As <span className="font-semibold text-primary">{anonymousUsername}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Be respectful • Harmful content will be removed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
