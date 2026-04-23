import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const { ideaTitle, ideaConcept, techStack, stage } = await req.json();
    const apiKey = Deno.env.get('GROQ_API_KEY');

    const ctx = `App: "${ideaTitle}". Concept: ${(ideaConcept || '').substring(0, 300)}. Stack: ${techStack || 'Node.js, React, PostgreSQL'}.`;

    const PROMPTS = {
      dockerfile: `Generate a production-ready multi-stage Dockerfile for: ${ctx}\nInclude: builder stage, non-root user, HEALTHCHECK, ENV vars, alpine base.`,
      cicd: `Generate a GitHub Actions CI/CD workflow (.github/workflows/deploy.yml) for: ${ctx}\nInclude: test, docker build/push, deploy to Railway (backend) and Vercel (frontend), rollback on failure.`,
      terraform: `Generate Terraform (main.tf + variables.tf + outputs.tf) for GCP Cloud Run + Cloud SQL for: ${ctx}`,
      railway: `Generate Railway deployment config (railway.json + Procfile + nixpacks.toml) for: ${ctx}`,
      vercel: `Generate vercel.json + deployment setup for: ${ctx}\nInclude routes, headers, environment variables list.`,
      supabase: `Generate Supabase setup SQL (migrations/001_schema.sql with RLS policies) and config.toml for: ${ctx}`,
    };

    if (!PROMPTS[stage]) return Response.json({ error: 'Unknown stage' }, { status: 400 });

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a DevOps expert. Output only file content with inline comments. Be concise and complete.' },
          { role: 'user', content: PROMPTS[stage] },
        ],
        max_tokens: 2000,
        temperature: 0.2,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Groq API error');

    return Response.json({ success: true, stage, content: data.choices[0].message.content });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});