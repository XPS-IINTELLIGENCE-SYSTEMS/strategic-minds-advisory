import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Video, Loader2, Image, Palette, FileText, Sparkles,
  Download, Copy, CheckCircle2, Play, Volume2, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VIDEO_STYLES = [
  { id: 'corporate', label: 'Corporate', desc: 'Professional, clean, trustworthy' },
  { id: 'dynamic', label: 'Dynamic', desc: 'High energy, bold transitions' },
  { id: 'minimalist', label: 'Minimalist', desc: 'Text-focused, editorial' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Dark, dramatic, premium' },
];

const VOICEOVER_TONES = ['Authoritative', 'Warm & Conversational', 'Energetic', 'Calm & Professional'];

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 Landscape', desc: 'YouTube, LinkedIn' },
  { id: '9:16', label: '9:16 Portrait', desc: 'TikTok, Reels, Stories' },
  { id: '1:1', label: '1:1 Square', desc: 'Instagram, Twitter' },
];

const BRAND_TOOLS = [
  { id: 'video', icon: Video, label: 'AI Video Brief', color: 'text-purple-400' },
  { id: 'logo', icon: Image, label: 'Logo Concepts', color: 'text-pink-400' },
  { id: 'palette', icon: Palette, label: 'Brand Palette', color: 'text-amber-400' },
  { id: 'copy', icon: FileText, label: 'Brand Copy', color: 'text-blue-400' },
];

export default function BrandingStudio() {
  const [activeTool, setActiveTool] = useState('video');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Video form
  const [videoForm, setVideoForm] = useState({
    campaignStrategy: '',
    videoStyle: 'corporate',
    voiceoverTone: 'Authoritative',
    aspectRatio: '16:9',
    duration: '60',
    brand: 'Strategic Minds Advisory',
    targetAudience: 'C-suite executives and business leaders',
  });

  // Logo form
  const [logoForm, setLogoForm] = useState({ brand: '', industry: '', style: 'modern', values: '' });

  // Palette form
  const [paletteForm, setPaletteForm] = useState({ brand: '', mood: '', industry: '' });

  // Copy form
  const [copyForm, setCopyForm] = useState({ brand: '', tagline: '', audience: '', channels: '' });

  const generateVideo = async () => {
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke('groqChat', {
      messages: [{
        role: 'user',
        content: `You are an expert AI video production director and creative strategist.

Create a comprehensive AI video production brief for the following campaign:

Campaign Strategy: ${videoForm.campaignStrategy || 'AI consulting services for enterprise leaders'}
Video Style: ${videoForm.videoStyle}
Brand: ${videoForm.brand}
Target Audience: ${videoForm.targetAudience}
Duration: ${videoForm.duration} seconds
Aspect Ratio: ${videoForm.aspectRatio}
Voiceover Tone: ${videoForm.voiceoverTone}

Generate a complete video production brief including:

## VIDEO SCRIPT & VOICEOVER
[Write the complete voiceover script, broken into 5-8 scenes]

## SCENE-BY-SCENE BREAKDOWN
For each scene: visual description, text overlay, transition type, duration

## VISUAL DIRECTION
Color palette, typography style, motion graphics style, b-roll suggestions

## AI GENERATION PROMPTS
3-5 specific prompts optimized for AI image/video generation tools (Runway, Pika, Sora) for key visuals

## MUSIC & AUDIO DIRECTION
Mood, BPM range, instrument palette, sound effect suggestions

## SHARING STRATEGY
How to distribute via Google Drive, LinkedIn, and email with specific captions for each platform

## PRODUCTION CHECKLIST
Step-by-step checklist to produce this video using AI tools`,
      }],
      systemPrompt: 'You are a world-class video creative director specializing in AI-generated corporate content. Be specific, actionable, and visually descriptive.',
    });
    setResult({ type: 'video', content: res.data.content });
    setLoading(false);
  };

  const generateLogo = async () => {
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke('groqChat', {
      messages: [{
        role: 'user',
        content: `Create 5 distinct logo concept briefs for "${logoForm.brand || 'Strategic Minds Advisory'}" in the ${logoForm.industry || 'AI consulting'} industry.

Style direction: ${logoForm.style}
Brand values: ${logoForm.values || 'Intelligence, Trust, Innovation, Precision'}

For each concept provide:
1. Concept name and philosophy
2. Symbol/mark description (detailed enough for AI image generation)
3. Typography recommendation (font style + weight)
4. Color palette (3-4 hex codes with rationale)
5. AI image generation prompt (for Midjourney/DALL-E)
6. Usage context (where it works best)

Also include:
- Brand mark variations (horizontal, stacked, icon-only)
- Dos and don'ts for logo usage
- Tagline options that complement each concept`,
      }],
      systemPrompt: 'You are a world-class brand identity designer. Create specific, distinctive logo concepts with precise AI generation prompts.',
    });
    setResult({ type: 'logo', content: res.data.content });
    setLoading(false);
  };

  const generatePalette = async () => {
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke('groqChat', {
      messages: [{
        role: 'user',
        content: `Design a complete brand color system for "${paletteForm.brand || 'Strategic Minds Advisory'}".

Industry: ${paletteForm.industry || 'AI/Tech Consulting'}
Brand mood: ${paletteForm.mood || 'Premium, intelligent, trustworthy, forward-thinking'}

Provide:
## PRIMARY PALETTE
- Primary color + 5 shades (with hex codes and CSS variables)
- Secondary color + 3 shades
- Accent color + 3 shades

## SEMANTIC COLORS
- Success, Warning, Error, Info (with hex codes)

## NEUTRAL SYSTEM
- 10-step gray scale optimized for the brand

## DARK MODE PALETTE
- Complete dark theme adaptations

## USAGE GUIDELINES
- When to use each color
- Ratio recommendations (60/30/10 rule)
- Accessibility contrast ratios (WCAG AA/AAA)
- Combination do's and don'ts

## IMPLEMENTATION
- CSS custom properties (ready to paste)
- Tailwind config snippet
- Figma color styles setup`,
      }],
      systemPrompt: 'You are an expert brand color systems designer. Create comprehensive, production-ready color systems.',
    });
    setResult({ type: 'palette', content: res.data.content });
    setLoading(false);
  };

  const generateCopy = async () => {
    setLoading(true);
    setResult(null);
    const res = await base44.functions.invoke('groqChat', {
      messages: [{
        role: 'user',
        content: `Write a complete brand copy toolkit for "${copyForm.brand || 'Strategic Minds Advisory'}".

Audience: ${copyForm.audience || 'C-suite executives, business leaders'}
Channels: ${copyForm.channels || 'LinkedIn, Website, Email, Events'}

Include:
## BRAND VOICE & TONE
- Voice characteristics (4-6 adjectives with examples)
- Tone spectrum (how it shifts by context)
- Words to use / words to avoid

## TAGLINE OPTIONS
- 10 tagline candidates with rationale
- 3 finalist recommendations

## HOMEPAGE COPY
- Hero headline + subheadline
- 3 value proposition statements
- Social proof blurb
- Primary and secondary CTAs

## ELEVATOR PITCHES
- 10-second version
- 30-second version
- 2-minute version

## EMAIL TEMPLATES
- Cold outreach subject lines (10 options)
- Follow-up template
- Newsletter intro template

## SOCIAL BIOS
- LinkedIn company page bio
- Twitter/X bio
- Instagram bio`,
      }],
      systemPrompt: 'You are a world-class brand copywriter. Write copy that is distinctive, memorable, and conversion-focused.',
    });
    setResult({ type: 'copy', content: res.data.content });
    setLoading(false);
  };

  const handleGenerate = () => {
    setResult(null);
    if (activeTool === 'video') generateVideo();
    else if (activeTool === 'logo') generateLogo();
    else if (activeTool === 'palette') generatePalette();
    else if (activeTool === 'copy') generateCopy();
  };

  const copyResult = () => {
    if (result) { navigator.clipboard.writeText(result.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const importFromContent = async () => {
    const items = await base44.entities.ContentItem.list('-created_date', 5);
    if (items.length > 0) {
      setVideoForm(f => ({ ...f, campaignStrategy: items[0].body?.substring(0, 500) + '...' }));
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="font-display text-2xl text-gradient-ivory">Branding Studio</h2>
          <p className="text-sm text-muted-foreground mt-1">AI-powered brand assets, video briefs, and creative direction</p>
        </div>

        {/* Tool tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BRAND_TOOLS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => { setActiveTool(t.id); setResult(null); }}
                className={`p-4 rounded-2xl border transition-all text-left ${activeTool === t.id ? 'border-accent bg-accent/10' : 'border-border bg-card/50 hover:bg-card/80'}`}>
                <Icon className={`w-5 h-5 ${t.color} mb-2`} />
                <div className="text-sm font-medium">{t.label}</div>
              </button>
            );
          })}
        </div>

        {/* VIDEO TOOL */}
        {activeTool === 'video' && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Campaign Configuration</div>
                <button onClick={importFromContent} className="text-xs text-accent hover:text-accent/80 transition flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Import from Content Engine
                </button>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Campaign Strategy / Brief</label>
                <textarea value={videoForm.campaignStrategy}
                  onChange={e => setVideoForm(f => ({ ...f, campaignStrategy: e.target.value }))}
                  placeholder="Paste your campaign strategy, key messages, or content from the Content Engine..."
                  rows={4} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition resize-none" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Brand Name</label>
                  <input value={videoForm.brand} onChange={e => setVideoForm(f => ({ ...f, brand: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Target Audience</label>
                  <input value={videoForm.targetAudience} onChange={e => setVideoForm(f => ({ ...f, targetAudience: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Video Style</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {VIDEO_STYLES.map(s => (
                    <button key={s.id} onClick={() => setVideoForm(f => ({ ...f, videoStyle: s.id }))}
                      className={`text-left p-3 rounded-xl border transition-all text-xs ${videoForm.videoStyle === s.id ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-secondary/30 text-foreground/70 hover:bg-secondary'}`}>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-muted-foreground mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Voiceover Tone</label>
                  <select value={videoForm.voiceoverTone} onChange={e => setVideoForm(f => ({ ...f, voiceoverTone: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition">
                    {VOICEOVER_TONES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Duration (seconds)</label>
                  <select value={videoForm.duration} onChange={e => setVideoForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition">
                    {['30', '60', '90', '120', '180'].map(d => <option key={d}>{d}s</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Aspect Ratio</label>
                  <select value={videoForm.aspectRatio} onChange={e => setVideoForm(f => ({ ...f, aspectRatio: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition">
                    {ASPECT_RATIOS.map(r => <option key={r.id} value={r.id}>{r.label} — {r.desc}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGO TOOL */}
        {activeTool === 'logo' && (
          <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Brand Name</label>
                <input value={logoForm.brand} onChange={e => setLogoForm(f => ({ ...f, brand: e.target.value }))}
                  placeholder="Strategic Minds Advisory"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Industry</label>
                <input value={logoForm.industry} onChange={e => setLogoForm(f => ({ ...f, industry: e.target.value }))}
                  placeholder="AI Consulting, FinTech, SaaS..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Style Direction</label>
                <select value={logoForm.style} onChange={e => setLogoForm(f => ({ ...f, style: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition">
                  {['modern', 'classic', 'minimal', 'bold', 'tech', 'luxury'].map(s => <option key={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Core Brand Values</label>
                <input value={logoForm.values} onChange={e => setLogoForm(f => ({ ...f, values: e.target.value }))}
                  placeholder="Intelligence, Trust, Innovation..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              </div>
            </div>
          </div>
        )}

        {/* PALETTE TOOL */}
        {activeTool === 'palette' && (
          <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Brand Name</label>
                <input value={paletteForm.brand} onChange={e => setPaletteForm(f => ({ ...f, brand: e.target.value }))}
                  placeholder="Strategic Minds Advisory"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Industry</label>
                <input value={paletteForm.industry} onChange={e => setPaletteForm(f => ({ ...f, industry: e.target.value }))}
                  placeholder="AI Consulting"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Brand Mood</label>
                <input value={paletteForm.mood} onChange={e => setPaletteForm(f => ({ ...f, mood: e.target.value }))}
                  placeholder="Premium, intelligent, modern..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              </div>
            </div>
          </div>
        )}

        {/* COPY TOOL */}
        {activeTool === 'copy' && (
          <div className="p-5 rounded-2xl border border-border bg-card/50 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Brand Name</label>
                <input value={copyForm.brand} onChange={e => setCopyForm(f => ({ ...f, brand: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Target Audience</label>
                <input value={copyForm.audience} onChange={e => setCopyForm(f => ({ ...f, audience: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Current Tagline (if any)</label>
                <input value={copyForm.tagline} onChange={e => setCopyForm(f => ({ ...f, tagline: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Key Channels</label>
                <input value={copyForm.channels} onChange={e => setCopyForm(f => ({ ...f, channels: e.target.value }))}
                  placeholder="LinkedIn, Website, Email, Events"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition" />
              </div>
            </div>
          </div>
        )}

        <button onClick={handleGenerate} disabled={loading}
          className="btn-ivory rounded-full w-full py-3.5 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
            : <><Sparkles className="w-4 h-4" /> Generate {BRAND_TOOLS.find(t => t.id === activeTool)?.label}</>}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Generated Output</div>
                <button onClick={copyResult}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary transition">
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy All</>}
                </button>
              </div>
              <div className="p-5 rounded-2xl border border-border bg-card/50 max-h-[60vh] overflow-y-auto">
                <pre className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed font-sans">{result.content}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}