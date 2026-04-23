import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SUGGESTIONS = [
  'What services do you offer?',
  'How is pricing structured?',
  'Tell me about Vision Cortex',
  'What is stress testing?',
];

export default function FloatingAIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.functions.invoke('serviceAIAssistant', { message: text });
      const aiMessage = { role: 'assistant', content: response.data.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { role: 'assistant', content: 'Sorry, I couldn\'t process that. Please try again or contact us directly.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-8 left-8 z-40 btn-ivory w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:opacity-90 transition"
        aria-label="Open AI chat"
      >
        <MessageCircle className="w-5 h-5" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed bottom-8 left-8 z-40 w-full max-w-sm bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] md:h-[500px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-accent/10 to-transparent">
                <div>
                  <h3 className="font-display text-lg">Service Assistant</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Powered by Groq AI</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <MessageCircle className="w-8 h-8 text-accent/40 mb-3" />
                    <p className="text-sm text-muted-foreground">Ask me about our services, pricing, or how we can help.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-accent/15 text-foreground'
                            : 'bg-secondary/50 text-foreground'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary/50 px-4 py-2.5 rounded-2xl">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {messages.length === 0 && (
                <div className="px-6 py-3 border-t border-border/50 bg-background/50">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Try asking:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="text-left text-xs px-3 py-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary transition text-muted-foreground hover:text-foreground line-clamp-2"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="px-6 py-4 border-t border-border flex gap-2 bg-background/50"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={loading}
                  className="flex-1 bg-secondary/50 border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-accent transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-full bg-accent/15 text-accent hover:bg-accent/25 transition flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}