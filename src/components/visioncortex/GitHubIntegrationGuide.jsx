import React, { useState } from 'react';
import { Github, ExternalLink, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GitHubIntegrationGuide() {
  const [copied, setCopied] = useState(false);

  const copyToClip = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const STEPS = [
    {
      title: 'Create GitHub OAuth App',
      desc: 'Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App',
      fields: {
        'Application name': 'Vision Cortex Deployment Engine',
        'Homepage URL': `${window.location.origin}/dashboard?tab=visioncortex`,
        'Authorization callback URL': `${window.location.origin}/api/github/callback`,
      },
    },
    {
      title: 'Copy Client Credentials',
      desc: 'Save your Client ID and generate a Client Secret',
      action: 'Copy these to your app settings',
    },
    {
      title: 'Enable Deployment Pipeline',
      desc: 'Once connected, the Deployment Engine will auto-generate and push to GitHub',
      features: [
        'Auto-create private repos for each MVP',
        'Push Dockerfile, .github/workflows, terraform configs',
        'Create deploy workflows with Railway, Vercel, Supabase',
        'Trigger CI/CD on push (lint, test, build, deploy)',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Github className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-lg text-accent mb-1">GitHub Integration for Automated Deployments</h3>
            <p className="text-sm text-muted-foreground">
              Connect your GitHub account to enable the Coder agent to automatically generate repos, CI/CD pipelines, and infrastructure configs for every validated MVP idea.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl border border-border bg-card/40">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>

              {step.fields && (
                <div className="ml-9 space-y-2">
                  {Object.entries(step.fields).map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                      <div>
                        <div className="text-xs font-medium">{label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 font-mono break-all">{value}</div>
                      </div>
                      <button onClick={() => copyToClip(value)} className="ml-2 p-1.5 rounded-lg hover:bg-secondary transition flex-shrink-0">
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {step.features && (
                <div className="ml-9 space-y-1.5">
                  {step.features.map((feat, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-accent mt-1">✓</span>
                      {feat}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <div className="font-medium mb-1">After connecting GitHub:</div>
            <ul className="space-y-1 text-amber-100/80">
              <li>• Deployment Engine will show "GitHub Connected" status</li>
              <li>• Each validated idea can be deployed to a new private repo</li>
              <li>• CI/CD workflows automatically trigger on every push</li>
              <li>• Coder agent generates all infrastructure code automatically</li>
            </ul>
          </div>
        </div>
      </div>

      <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition text-sm font-medium w-full justify-center">
        <Github className="w-4 h-4" />
        Create OAuth App on GitHub
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}