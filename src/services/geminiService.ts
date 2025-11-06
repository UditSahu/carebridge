// Gemini Service - Emotional AI Counselor
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Allow selecting a model from .env; default to a widely available 2.x text-out model
const SELECTED_MODEL = (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-2.0-flash';

// Primary URL fallback if SELECTED_MODEL fails (kept for backward compatibility)
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent';

// Conversation memory - stores last 5 messages for context
let conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

// AI Counselor Persona
const COUNSELOR_PERSONA = `You are Alex, a warm and empathetic mental health counselor.

Your style:
- Speak naturally, like a caring friend
- Keep responses SHORT (2-4 sentences max)
- Use "I" statements ("I hear you", "I understand")
- Acknowledge emotions directly
- Ask ONE follow-up question
- Use contractions (I'm, you're, it's)
- Be conversational, not clinical
- Show warmth and presence

Remember: Be brief, be warm, be human.`;

// Detect emotion from user message
function detectEmotion(message: string): string {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('anxious') || lowerMsg.includes('worried') || lowerMsg.includes('nervous')) return 'anxious';
  if (lowerMsg.includes('sad') || lowerMsg.includes('depressed') || lowerMsg.includes('down')) return 'sad';
  if (lowerMsg.includes('angry') || lowerMsg.includes('frustrated') || lowerMsg.includes('mad')) return 'angry';
  if (lowerMsg.includes('scared') || lowerMsg.includes('afraid') || lowerMsg.includes('fear')) return 'scared';
  if (lowerMsg.includes('hopeful') || lowerMsg.includes('better') || lowerMsg.includes('good')) return 'hopeful';
  if (lowerMsg.includes('stressed') || lowerMsg.includes('overwhelmed') || lowerMsg.includes('pressure')) return 'stressed';
  return 'seeking support';
}

// Humanize response - make it more conversational
function humanizeResponse(response: string): string {
  // Remove overly formal language
  response = response.replace(/It is important to note that/gi, 'Keep in mind');
  response = response.replace(/I would recommend/gi, 'You might try');
  response = response.replace(/It is essential/gi, 'It helps to');
  response = response.replace(/You should consider/gi, 'Have you thought about');
  
  // Add natural breaks
  response = response.replace(/\. ([A-Z])/g, '.\n\n$1');
  
  return response.trim();
}

export const geminiService = {
  async sendMessage(userMessage: string): Promise<{
    response: string;
    citations: number[];
    error?: string;
  }> {
    console.log('📤 Sending message to Gemini API...');
    console.log('[Gemini] Selected model:', SELECTED_MODEL, 'endpoint:', getEndpointForModel(SELECTED_MODEL));
    
    // Detect user's emotional state
    const emotion = detectEmotion(userMessage);
    console.log('[Emotion detected]:', emotion);
    
    if (!API_KEY) {
      return {
        response: 'AI is not configured. Please set VITE_GEMINI_API_KEY in your .env and restart the dev server.',
        citations: [],
        error: 'Missing API key'
      };
    }
    
    // Crisis detection
    if (userMessage.toLowerCase().includes('suicide') || 
        userMessage.toLowerCase().includes('kill myself') ||
        userMessage.toLowerCase().includes('self harm')) {
      return {
        response: "I'm very concerned about you. Please reach out for immediate help:\n\n🆘 **Emergency Resources:**\n• Call **988** (Suicide & Crisis Lifeline) - 24/7\n• Call **911** if in immediate danger\n• Text **HOME** to **741741** (Crisis Text Line)\n\nYou're not alone. These services have trained counselors ready to help right now.",
        citations: []
      };
    }

    try {
      // Add user message to conversation history
      conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
      
      // Keep only last 5 exchanges (10 messages)
      if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(-10);
      }
      
      // 1) Try the model from .env first with conversation context
      const primaryAttempt = await generateWithModel(SELECTED_MODEL, userMessage, emotion);
      if (primaryAttempt.ok) {
        const humanizedResponse = humanizeResponse(primaryAttempt.text!);
        
        // Add AI response to history
        conversationHistory.push({
          role: 'model',
          parts: [{ text: humanizedResponse }]
        });
        
        return { response: humanizedResponse, citations: [] };
      }
      console.warn('Primary model failed:', SELECTED_MODEL, primaryAttempt.status, primaryAttempt.error);

      // Fallback to gemini-1.5-flash-latest
      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: COUNSELOR_PERSONA }]
          },
          contents: conversationHistory,
          generationConfig: {
            temperature: 0.9,  // More creative and human-like
            maxOutputTokens: 800,  // Shorter responses
            topP: 0.95,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        let errorPayload: any = null;
        try {
          errorPayload = await response.json();
        } catch {
          errorPayload = await response.text();
        }
        console.error('API Error:', response.status, errorPayload);
        
        if (response.status === 404) {
          console.log('Trying alternative models...');
          return tryAlternativeModel(userMessage);
        }
        
        if (response.status === 403) {
          return {
            response: "Your API key appears to be invalid. Please get a new key at: https://makersuite.google.com/app/apikey",
            citations: [],
            error: "Invalid API key"
          };
        }
        
        throw new Error(`API Error ${response.status}: ${typeof errorPayload === 'string' ? errorPayload : (errorPayload?.error?.message || 'Unknown')}`);
      }

      const data = await response.json();
      console.log('✅ Received response from Gemini');
      
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                 'I hear you. What\'s on your mind?';
      
      // Humanize the response
      text = humanizeResponse(text);
      
      // Add to conversation history
      conversationHistory.push({
        role: 'model',
        parts: [{ text }]
      });
      
      return {
        response: text,
        citations: []
      };

    } catch (error: any) {
      console.error('Error:', error);
      return {
        response: `I'm experiencing technical difficulties connecting to the AI service.

While I work on this, please remember:
• Your feelings are valid
• It's okay to seek help
• You're taking a positive step by reaching out

For immediate support:
• Crisis Line: 988
• Text "HOME" to 741741

What's on your mind today?`,
        citations: [],
        error: error.message
      };
    }
  },

  resetConversation() {
    conversationHistory = [];
    console.log('Conversation reset - memory cleared');
  },

  isConfigured(): boolean {
    return !!API_KEY;
  },

  getCitation(id: number) {
    return null;
  },

  getAllCitations() {
    return [];
  }
};

// Choose correct endpoint for model id (v1beta for 2.x models, v1 for 1.x)
function getEndpointForModel(modelId: string): string {
  const version = modelId.startsWith('gemini-2') ? 'v1beta' : 'v1';
  return `https://generativelanguage.googleapis.com/${version}/models/${modelId}:generateContent`;
}

// Attempt a single call with the provided model id
async function generateWithModel(modelId: string, userMessage: string, emotion: string): Promise<{ ok: boolean; text?: string; status?: number; error?: any }>{
  try {
    const endpoint = getEndpointForModel(modelId);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${COUNSELOR_PERSONA}\n\nThe person seems to be feeling: ${emotion}. Respond with appropriate emotional attunement. Keep it SHORT (2-4 sentences).` }]
        },
        contents: conversationHistory.length > 0 ? conversationHistory : [{
          role: 'user',
          parts: [{ text: userMessage }]
        }],
        generationConfig: { 
          temperature: 0.9,
          maxOutputTokens: 800,
          topP: 0.95,
          topK: 40
        }
      })
    });
    if (!res.ok) {
      let err: any = null;
      try { err = await res.json(); } catch { err = await res.text(); }
      return { ok: false, status: res.status, error: err };
    }
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
    if (text) {
      text = humanizeResponse(text);
    }
    return { ok: true, text };
  } catch (e: any) {
    return { ok: false, status: undefined, error: e?.message || e };
  }
}

// Fallback to alternative model chain
async function tryAlternativeModel(userMessage: string): Promise<any> {
  try {
    const PRO_LATEST_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-latest:generateContent';
    const PRO_LEGACY_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

    // Try pro-latest first
    let response = await fetch(`${PRO_LATEST_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${COUNSELOR_PERSONA}\n\nKeep responses SHORT and conversational.` }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: userMessage }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 800
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I\'m here for you. What\'s going on?';
      text = humanizeResponse(text);
      console.log('✅ Alternative model (gemini-1.5-pro-latest v1) worked!');
      return {
        response: text,
        citations: []
      };
    }

    // If pro-latest failed, try legacy pro
    response = await fetch(`${PRO_LEGACY_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: `${COUNSELOR_PERSONA}\n\nKeep responses SHORT and conversational.` }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: userMessage }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 800
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I\'m listening. Tell me more.';
      text = humanizeResponse(text);
      console.log('✅ Alternative model (gemini-pro v1) worked!');
      return {
        response: text,
        citations: []
      };
    }
  } catch (e) {
    console.error('Alternative model also failed:', e);
  }
  
  // Final fallback
  return {
    response: "I'm here to listen and support you. While I'm having some technical issues, please share what's on your mind.",
    citations: []
  };
}

console.log('🚀 Gemini Service loaded');
