import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DailyDigestModule() {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadDigest();
  }, []);

  const loadDigest = async () => {
    try {
      const user = await base44.auth.me();
      const today = new Date().toISOString().split('T')[0];
      
      const digests = await base44.entities.DailyDigest.filter({
        user_email: user.email,
        digest_date: today,
      });

      if (digests.length > 0) {
        setDigest(digests[0]);
      }
    } catch (error) {
      console.error('Failed to load digest:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewDigest = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateDailyDigest', {});
      
      setDigest({
        summary: response.data.summary,
        intelligence_count: response.data.intel_count,
        voice_insights_count: response.data.voice_count,
        stress_tests_run: response.data.tests_count,
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-medium text-foreground">Daily Strategic Digest</h3>
              <p className="text-xs text-muted-foreground">Executive morning brief - {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <Button
            onClick={generateNewDigest}
            disabled={generating}
            variant="outline"
            className="rounded-lg"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {digest ? (
        <div className="space-y-4">
          {/* Executive Summary */}
          <div className="glass-card rounded-2xl p-6 border border-border">
            <h4 className="font-bold text-accent mb-3">📊 Executive Summary</h4>
            <p className="text-sm text-foreground leading-relaxed">{digest.summary}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Intelligence Signals</p>
              <p className="text-2xl font-bold text-accent">{digest.intelligence_count || 0}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Voice Insights</p>
              <p className="text-2xl font-bold text-accent">{digest.voice_insights_count || 0}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Stress Tests</p>
              <p className="text-2xl font-bold text-accent">{digest.stress_tests_run || 0}</p>
            </div>
          </div>

          {/* Critical Findings */}
          {digest.critical_findings && (
            <div className="glass-card rounded-2xl p-6 border border-border">
              <h4 className="font-bold text-destructive mb-3">🚨 Critical Findings</h4>
              <p className="text-sm text-foreground/80 whitespace-pre-line">
                {digest.critical_findings}
              </p>
            </div>
          )}

          {/* Recommendations */}
          {digest.recommendations && (
            <div className="glass-card rounded-2xl p-6 border border-border">
              <h4 className="font-bold text-accent mb-3">✅ Strategic Recommendations</h4>
              <p className="text-sm text-foreground/80 whitespace-pre-line">
                {digest.recommendations}
              </p>
            </div>
          )}

          {/* CTA */}
          <p className="text-xs text-muted-foreground text-center">
            Full analysis available in your dashboard. Digest sent to email.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 border border-border text-center">
          <p className="text-sm text-muted-foreground mb-4">No digest generated yet for today</p>
          <Button
            onClick={generateNewDigest}
            disabled={generating}
            className="btn-ivory rounded-lg"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Generate Today's Digest
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}