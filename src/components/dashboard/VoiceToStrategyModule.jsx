import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Mic, StopCircle, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceToStrategyModule() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [insights, setInsights] = useState(null);
  const [processing, setProcessing] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const [copied, setCopied] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = e => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => processAudio();

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Recording failed:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const processAudio = async () => {
    setProcessing(true);
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });

    try {
      // Upload audio to Supabase storage
      const fileName = `audio-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-inputs')
        .upload(fileName, audioBlob);
      if (uploadError) throw uploadError;

      // Transcribe and extract insights
      const { data: res, error: fnError } = await supabase.functions.invoke('voiceToInsight', {
        audioUrl: uploadData.path,
      });
      if (fnError) throw fnError;

      setTranscript(res.transcript);
      setInsights(res.insights);

      // Log to intelligence feed
      const { data: { user } } = await supabase.auth.getUser();
      const { error: createError } = await supabase.from('strategic_intelligence').insert([{
        user_email: user?.email,
        title: res.insights?.category || 'Voice Note',
        content: res.transcript,
        source_type: 'voice_note',
        sentiment: res.insights?.sentiment || 'neutral',
        impact_score: res.insights?.impact || 50,
        tags: res.insights?.tags?.join(',') || '',
      }]);
      if (createError) throw createError;

      alert('✓ Insights logged to intelligence feed');
    } catch (error) {
      console.error('Processing failed:', error);
    }

    setProcessing(false);
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-gradient-ivory">Voice to Strategy</h2>
        <p className="text-sm text-muted-foreground mt-1">Capture insights from your voice</p>
      </div>

      {/* Recording Controls */}
      <div className="p-6 rounded-2xl border border-border bg-card/50 text-center space-y-4">
        {!recording ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            disabled={processing}
            className={`mx-auto w-20 h-20 rounded-full border-4 flex items-center justify-center transition ${
              processing
                ? 'border-accent/50 bg-accent/10'
                : 'border-accent bg-accent/20 hover:bg-accent/30'
            }`}
          >
            <Mic className={`w-8 h-8 ${processing ? 'text-accent/50' : 'text-accent'}`} />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopRecording}
            className="mx-auto w-20 h-20 rounded-full border-4 border-red-500 bg-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition animate-pulse"
          >
            <StopCircle className="w-8 h-8 text-red-500" />
          </motion.button>
        )}

        <div className="text-sm font-medium text-foreground">
          {recording && <span className="text-red-400">Recording…</span>}
          {processing && <span className="text-accent flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing…</span>}
          {!recording && !processing && <span className="text-muted-foreground">Click to start recording</span>}
        </div>
      </div>

      {/* Transcript */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-border bg-card/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Transcript</h3>
              <button
                onClick={copyTranscript}
                className="p-1.5 rounded-lg hover:bg-secondary transition"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed p-3 rounded-lg bg-secondary/30">
              {transcript}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insights */}
      <AnimatePresence>
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-border bg-card/50 space-y-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-medium text-foreground">Extracted Insights</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Category', value: insights.category },
                { label: 'Sentiment', value: insights.sentiment?.toUpperCase() },
                { label: 'Impact Score', value: `${insights.impact}/100` },
                { label: 'Confidence', value: `${insights.confidence}%` },
              ].map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-secondary/30">
                  <div className="text-[10px] text-muted-foreground mb-0.5">{item.label}</div>
                  <div className="text-xs font-medium text-accent">{item.value}</div>
                </div>
              ))}
            </div>

            {insights.tags && insights.tags.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">
                  Tags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {insights.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full text-[10px] font-medium bg-accent/15 text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {insights.summary && (
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">
                  Summary
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{insights.summary}</p>
              </div>
            )}

            {insights.actionItems && insights.actionItems.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">
                  Suggested Actions
                </div>
                <ul className="space-y-1">
                  {insights.actionItems.map((item, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                      <span className="text-accent mt-0.5">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}