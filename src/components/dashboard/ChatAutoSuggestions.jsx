import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatAutoSuggestions({ onSelectSuggestion }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSuggestions();
  }, []);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Fetch recent strategic intelligence and trending ideas
      const recentIdeas = await base44.entities.VisionIdea.list('-created_date', 5);
      const premiumIntel = await base44.entities.StrategicIntelligence.filter({ is_premium_only: true }, '-value_score', 3);
      
      // Generate smart contextual suggestions
      const sug = [
        {
          icon: Lightbulb,
          text: `Analyze ${recentIdeas[0]?.title || 'the latest idea'} using Jobs to be Done framework`,
          category: 'Strategy',
          color: 'text-amber-400',
        },
        {
          icon: TrendingUp,
          text: `Compare recent market trends in ${recentIdeas[0]?.domain || 'fintech'} — what's emerging?`,
          category: 'Market Insight',
          color: 'text-green-400',
        },
        {
          icon: AlertCircle,
          text: `What are the psychological triggers that convert users in this market? (Cialdini principles)`,
          category: 'Psychology',
          color: 'text-purple-400',
        },
        {
          icon: Lightbulb,
          text: `Build a go-to-market strategy using Sequoia Capital's playbook for B2B SaaS`,
          category: 'GTM Strategy',
          color: 'text-blue-400',
        },
      ];

      setSuggestions(sug);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
    setLoading(false);
  };

  return (
    <div className="px-4 pt-3 pb-3 border-t border-border space-y-2">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground px-2">Smart Suggestions</div>
      {suggestions.map((sug, i) => {
        const Icon = sug.icon;
        return (
          <motion.button key={i}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            onClick={() => onSelectSuggestion(sug.text)}
            className="w-full text-left px-3 py-2.5 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/60 transition group">
            <div className="flex items-start gap-2">
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${sug.color}`} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium group-hover:text-accent transition truncate">{sug.text}</div>
                <div className={`text-[9px] mt-0.5 ${sug.color}`}>{sug.category}</div>
              </div>
            </div>
          </motion.button>
        );
      })}
      <button onClick={generateSuggestions} className="w-full text-[10px] text-muted-foreground hover:text-accent transition py-1.5 px-2">
        ↻ Refresh Suggestions
      </button>
    </div>
  );
}