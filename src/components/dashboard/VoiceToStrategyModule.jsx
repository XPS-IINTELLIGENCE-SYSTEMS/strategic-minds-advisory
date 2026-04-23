import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Mic, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VoiceToStrategyModule() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [result, setResult] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setRecording(true);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, 60000);
    } catch (error) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setRecording(false);
    }
  };

  const submitRecording = async () => {
    if (chunksRef.current.length === 0) return;

    setProcessing(true);
    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();

      reader.onload = async () => {
        const base64Audio = reader.result.split(',')[1];

        const response = await base44.functions.invoke('voiceToStrategy', {
          audioBase64: base64Audio,
          recordingTitle,
        });

        setResult({
          transcription: response.data.transcription,
          signals: response.data.competitive_signals,
          modelsTestedCount: response.data.models_tested,
        });

        // Reset for next recording
        chunksRef.current = [];
        setRecordingTitle('');
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Mic className="w-5 h-5 text-accent" />
          <div>
            <h3 className="font-medium text-foreground">Voice-to-Strategy Intelligence</h3>
            <p className="text-xs text-muted-foreground">Record 60-second insights to auto-generate intelligence & stress tests</p>
          </div>
        </div>
      </div>

      {!result ? (
        <div className="glass-card rounded-2xl p-8 border border-border">
          <div className="space-y-4">
            {/* Recording Title */}
            <div>
              <label className="text-xs font-bold text-accent mb-2 block">Recording Title (Optional)</label>
              <input
                type="text"
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                placeholder="e.g., CompetitorA funding news..."
                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent transition"
              />
            </div>

            {/* Recording Controls */}
            <div className="flex gap-2">
              {!recording ? (
                <Button
                  onClick={startRecording}
                  className="flex-1 btn-ivory rounded-lg"
                >
                  <Mic className="w-4 h-4" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="flex-1 bg-destructive hover:bg-destructive/90 rounded-lg"
                >
                  ⏹ Stop Recording
                </Button>
              )}
            </div>

            {/* Timer */}
            {recording && (
              <div className="text-center">
                <p className="text-sm font-medium text-accent">Recording... (Max 60 seconds)</p>
                <div className="mt-2 h-1 bg-secondary/40 rounded-full overflow-hidden">
                  <div className="h-full bg-accent animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            )}

            {/* Submit Button */}
            {chunksRef.current.length > 0 && !recording && (
              <Button
                onClick={submitRecording}
                disabled={processing}
                className="w-full btn-ivory rounded-lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Recording
                  </>
                )}
              </Button>
            )}

            {/* Info */}
            <p className="text-xs text-muted-foreground text-center">
              💡 Tip: Speak clearly about competitive moves, market signals, or strategic insights
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Transcription */}
          <div className="glass-card rounded-2xl p-6 border border-border">
            <h4 className="font-bold text-accent mb-3">Transcription</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{result.transcription}</p>
          </div>

          {/* Competitive Signals */}
          <div className="glass-card rounded-2xl p-6 border border-border">
            <h4 className="font-bold text-accent mb-3">Extracted Competitive Signals</h4>
            <ul className="space-y-2">
              {result.signals.map((signal, idx) => (
                <li key={idx} className="text-sm text-foreground/80">
                  ✓ {signal}
                </li>
              ))}
            </ul>
          </div>

          {/* Automation Status */}
          <div className="glass-card rounded-2xl p-6 border border-border bg-green-500/10 border-green-500/20">
            <p className="text-sm text-green-400 font-medium">
              ✓ Intelligence Created & {result.modelsTestedCount} models stress-tested
            </p>
            <p className="text-xs text-green-400/70 mt-1">
              Workflow Engine automatically triggered related scenarios
            </p>
          </div>

          {/* Reset */}
          <Button
            onClick={() => setResult(null)}
            variant="outline"
            className="w-full rounded-lg"
          >
            Record Another Insight
          </Button>
        </div>
      )}
    </div>
  );
}