import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mic, Loader2, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceInputButton() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + transcriptPart + ' ');
          } else {
            interim += transcriptPart;
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError(`Error: ${event.error}`);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      setError('Speech Recognition not supported');
      return;
    }
    setTranscript('');
    setError(null);
    setIsListening(true);
    recognitionRef.current.start();
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      const response = await base44.functions.invoke('processVoiceInput', {
        transcript: transcript.trim(),
      });

      if (response.data.success) {
        setTranscript('');
        setError(null);
      } else {
        setError('Failed to create entry');
      }
    } catch (err) {
      setError('Error processing voice input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setError(null);
  };

  return (
    <AnimatePresence>
      {transcript || isListening ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="md:hidden fixed bottom-28 left-4 right-4 z-40 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-xl"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: isListening ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.6, repeat: isListening ? Infinity : 0 }}
                  className="w-3 h-3 rounded-full bg-red-500"
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {isListening ? 'Listening...' : 'Ready to submit'}
                </span>
              </div>
              <button
                onClick={handleClear}
                className="p-1 hover:bg-secondary rounded-lg transition"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="bg-background/50 rounded-xl p-3 min-h-[60px] max-h-[120px] overflow-y-auto">
              <p className="text-sm text-foreground leading-relaxed">{transcript}</p>
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={isListening ? handleStopListening : handleStartListening}
                disabled={isProcessing}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                  isListening
                    ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
                    : 'bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20'
                }`}
              >
                <Mic className="w-4 h-4" />
                {isListening ? 'Stop' : 'Resume'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !transcript.trim()}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-accent/15 text-accent hover:bg-accent/20 border border-accent/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={handleStartListening}
          className="md:hidden fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-accent hover:bg-accent/90 text-primary-foreground shadow-lg flex items-center justify-center transition active:scale-95"
          title="Voice input"
        >
          <Mic className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}