import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { triggerEvent, triggerData } = body;

    // Fetch all active workflows
    const workflows = await base44.asServiceRole.entities.Workflow.filter({
      is_active: true,
      trigger_type: triggerEvent,
    });

    const results = [];

    for (const workflow of workflows) {
      try {
        // Parse conditions and config
        const conditions = JSON.parse(workflow.trigger_conditions || '{}');
        const actionConfig = JSON.parse(workflow.action_config || '{}');

        // Check if trigger conditions match
        const conditionsMet = evaluateConditions(conditions, triggerData);

        if (conditionsMet) {
          // Execute the action
          let actionResult;

          switch (workflow.action_type) {
            case 'run_stress_test':
              actionResult = await executeStressTest(base44, actionConfig, triggerData);
              break;
            case 'update_strategy':
              actionResult = await updateStrategy(base44, actionConfig, triggerData);
              break;
            case 'notify_team':
              actionResult = await notifyTeam(base44, actionConfig, triggerData);
              break;
            case 'generate_report':
              actionResult = await generateReport(base44, actionConfig, triggerData);
              break;
            case 'update_pitch':
              actionResult = await updatePitch(base44, actionConfig, triggerData);
              break;
          }

          // Update workflow execution
          await base44.asServiceRole.entities.Workflow.update(workflow.id, {
            last_triggered: new Date().toISOString(),
            execution_count: (workflow.execution_count || 0) + 1,
          });

          results.push({
            workflow_id: workflow.id,
            workflow_name: workflow.name,
            action: workflow.action_type,
            result: actionResult,
            executed: true,
          });
        }
      } catch (error) {
        console.error(`Workflow ${workflow.name} failed:`, error);
        results.push({
          workflow_id: workflow.id,
          workflow_name: workflow.name,
          error: error.message,
          executed: false,
        });
      }
    }

    return Response.json({
      success: true,
      trigger_event: triggerEvent,
      workflows_evaluated: workflows.length,
      workflows_executed: results.filter(r => r.executed).length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function evaluateConditions(conditions, triggerData) {
  if (!conditions || Object.keys(conditions).length === 0) return true;

  for (const [key, expectedValue] of Object.entries(conditions)) {
    const actualValue = triggerData[key];
    if (actualValue !== expectedValue && expectedValue !== '*') {
      return false;
    }
  }
  return true;
}

async function executeStressTest(base44, config, triggerData) {
  const ideaId = config.idea_id || triggerData.idea_id;
  const scenarios = config.scenarios || ['Global Recession', 'Geopolitical Crisis'];

  await base44.asServiceRole.functions.invoke('weeklyStressTestAutomation', {
    specificIdea: ideaId,
  });

  return { stress_tests_queued: scenarios.length };
}

async function updateStrategy(base44, config, triggerData) {
  const ideaId = config.idea_id || triggerData.idea_id;
  const strategyUpdate = config.strategy_update || 'Auto-pivot based on threat signal';

  const ideas = await base44.asServiceRole.entities.VisionIdea.filter({ id: ideaId });
  if (ideas.length > 0) {
    await base44.asServiceRole.entities.VisionIdea.update(ideaId, {
      full_concept: `${ideas[0].full_concept || ''}\n\n[AUTOMATED UPDATE] ${strategyUpdate}`,
    });
  }

  return { strategy_updated: true, idea_id: ideaId };
}

async function notifyTeam(base44, config, triggerData) {
  const subject = config.email_subject || `Automated Alert: ${triggerData.trigger_type}`;
  const message = config.email_template || `Trigger event detected: ${JSON.stringify(triggerData)}`;

  // In production, send to team emails
  console.log(`NOTIFICATION: ${subject} - ${message}`);

  return { notification_queued: true };
}

async function generateReport(base44, config, triggerData) {
  const reportType = config.report_type || 'executive_summary';

  await base44.asServiceRole.functions.invoke('generateMarketPulseReport', {
    reportType,
    triggerData,
  });

  return { report_generation_started: true, type: reportType };
}

async function updatePitch(base44, config, triggerData) {
  const modelId = config.model_id || triggerData.model_id;

  await base44.asServiceRole.functions.invoke('generateInvestorPitchDeck', {
    modelId,
    autoUpdate: true,
  });

  return { pitch_deck_updated: true, model_id: modelId };
}