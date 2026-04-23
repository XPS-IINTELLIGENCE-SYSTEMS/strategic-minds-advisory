import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { jobId, steps, jobName } = await req.json();

    const logs = [];
    const results = [];

    const log = (level, message) => {
      const entry = { timestamp: new Date().toISOString(), level, message };
      logs.push(entry);
    };

    log('info', `Starting workflow: ${jobName}`);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      log('info', `Step ${i + 1}/${steps.length}: ${step.type} — ${step.label}`);

      try {
        let stepResult = null;

        if (step.type === 'simulation') {
          const res = await base44.asServiceRole.functions.invoke('runSimulation', {
            variables: step.config?.variables || { market_size: '500', target_share: '5' },
            simulationType: step.config?.simulationType || 'Market Entry',
            periods: step.config?.periods || 12,
          });
          stepResult = res;
          // Auto-save simulation result
          await base44.asServiceRole.entities.SimulationResult.create({
            title: `${jobName} — Simulation`,
            type: step.config?.simulationType || 'Market Entry',
            result: JSON.stringify(res),
            summary: res.summary || 'Workflow-generated simulation',
            confidence: res.confidence || 0.75,
          });
          log('success', `Simulation complete. Confidence: ${Math.round((res.confidence || 0) * 100)}%`);

        } else if (step.type === 'content') {
          const res = await base44.asServiceRole.functions.invoke('generateContent', {
            contentType: step.config?.contentType || 'blog_post',
            topic: step.config?.topic || jobName,
            context: step.config?.context || 'AI consulting strategy',
            tone: step.config?.tone || 'Authoritative',
            length: step.config?.length || 'medium',
          });
          stepResult = res;
          await base44.asServiceRole.entities.ContentItem.create({
            title: `${jobName} — ${step.config?.contentType || 'blog_post'}`,
            content_type: step.config?.contentType || 'blog_post',
            topic: step.config?.topic || jobName,
            body: res.body || 'Content generation in progress',
            status: 'draft',
            word_count: res.wordCount || 0,
            tags: 'workflow-generated',
          });
          log('success', `Content generated: ${res.wordCount || 0} words`);

        } else if (step.type === 'social_analysis') {
          const res = await base44.asServiceRole.functions.invoke('analyzeSocial', {
            topic: step.config?.topic || jobName,
            platform: step.config?.platform || 'linkedin',
            industry: step.config?.industry || 'AI Consulting',
          });
          stepResult = res;
          log('success', `Social analysis complete. Opportunity score: ${res.opportunity_score}`);

        } else if (step.type === 'wait') {
          const seconds = step.config?.seconds || 2;
          await new Promise(r => setTimeout(r, seconds * 1000));
          log('info', `Wait step complete (${seconds}s)`);

        } else if (step.type === 'notify') {
          log('info', `Notification: ${step.config?.message || 'Workflow step completed'}`);
          stepResult = { notified: true };
        }

        results.push({ step: step.label, status: 'completed', result: stepResult });
        log('success', `Step ${i + 1} complete`);

      } catch (stepErr) {
        log('error', `Step ${i + 1} failed: ${stepErr.message}`);
        results.push({ step: step.label, status: 'failed', error: stepErr.message });
      }
    }

    log('info', `Workflow complete. ${results.filter(r => r.status === 'completed').length}/${steps.length} steps succeeded.`);

    return Response.json({
      status: results.every(r => r.status === 'completed') ? 'completed' : 'partial',
      steps: results,
      logs,
      summary: `${results.filter(r => r.status === 'completed').length}/${steps.length} steps completed successfully`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});