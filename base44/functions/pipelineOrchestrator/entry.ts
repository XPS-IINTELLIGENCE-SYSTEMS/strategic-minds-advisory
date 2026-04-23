import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { workspaceId, pipelineId, config } = await req.json();

    // Create pipeline run
    const pipelineRun = await base44.asServiceRole.entities.PipelineRun.create({
      workspace_id: workspaceId,
      user_email: user.email,
      pipeline_id: pipelineId,
      config: JSON.stringify(config),
      status: 'running',
      started_at: new Date().toISOString(),
      steps_completed: 0,
    });

    const results = [];
    let stepCount = 0;

    // Step 1: Scrape URLs
    if (config.scrapeUrls && config.scrapeUrls.length > 0) {
      const scrapeResult = await base44.functions.invoke('parallelScraper', {
        urls: config.scrapeUrls,
        extractionSchema: config.extractionSchema,
        workspaceId,
        jobId: `${pipelineRun.id}-scrape`,
      });
      results.push({ step: 'scrape', result: scrapeResult.data });
      stepCount++;

      await base44.asServiceRole.entities.PipelineRun.update(pipelineRun.id, {
        steps_completed: stepCount,
      });
    }

    // Step 2: Browserbase extraction for JS-heavy sites
    if (config.browserbaseUrls && config.browserbaseUrls.length > 0) {
      for (const url of config.browserbaseUrls) {
        const browserResult = await base44.functions.invoke('browserbaseScraper', {
          url,
          extractionSchema: config.extractionSchema,
          workspaceId,
          jobId: `${pipelineRun.id}-browser`,
        });
        results.push({ step: 'browserbase', url, result: browserResult.data });
      }
      stepCount++;

      await base44.asServiceRole.entities.PipelineRun.update(pipelineRun.id, {
        steps_completed: stepCount,
      });
    }

    // Step 3: Intelligence analysis via LLM
    if (config.analyzeIntelligence) {
      const intelligenceList = await base44.asServiceRole.entities.StrategicIntelligence.list('-created_date', 20);

      const analysisRes = await base44.functions.invoke('groqChat', {
        messages: [{
          role: 'user',
          content: `Analyze this competitive intelligence and provide market impact summary:\n${JSON.stringify(intelligenceList.map(i => ({ title: i.title, content: i.content })))}`,
        }],
        systemPrompt: 'You are a strategic intelligence analyst. Provide actionable insights.',
      });

      results.push({ step: 'analysis', result: analysisRes.data });
      stepCount++;

      await base44.asServiceRole.entities.PipelineRun.update(pipelineRun.id, {
        steps_completed: stepCount,
      });
    }

    // Step 4: Run simulations
    if (config.runSimulation) {
      const simResult = await base44.functions.invoke('runSimulation', {
        variables: config.simulationVariables,
        simulationType: config.simulationType || 'Market Entry',
        periods: config.periods || 12,
      });

      results.push({ step: 'simulation', result: simResult.data });
      stepCount++;

      await base44.asServiceRole.entities.PipelineRun.update(pipelineRun.id, {
        steps_completed: stepCount,
      });
    }

    // Step 5: Generate report
    if (config.generateReport) {
      const reportContent = `
## Pipeline Execution Report
**Run ID:** ${pipelineRun.id}
**Workspace:** ${workspaceId}
**Timestamp:** ${new Date().toISOString()}

### Results Summary
${results.map(r => `- **${r.step}**: ${JSON.stringify(r.result).substring(0, 200)}...`).join('\n')}

### Key Findings
${results[0]?.result?.successCount ? `Scraped ${results[0].result.successCount} URLs successfully` : ''}
${results[results.length - 1]?.result?.summary ? `Analysis: ${results[results.length - 1].result.summary}` : ''}
`;

      results.push({ step: 'report', content: reportContent });
      stepCount++;
    }

    // Mark pipeline as completed
    await base44.asServiceRole.entities.PipelineRun.update(pipelineRun.id, {
      status: 'completed',
      steps_completed: stepCount,
      results: JSON.stringify(results),
      completed_at: new Date().toISOString(),
    });

    return Response.json({
      pipelineRunId: pipelineRun.id,
      status: 'completed',
      stepsCompleted: stepCount,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Pipeline error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});