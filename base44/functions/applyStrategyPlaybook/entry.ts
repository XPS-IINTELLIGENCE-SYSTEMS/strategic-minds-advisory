import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { playbookId, modelId } = body;

    // Fetch playbook and model
    const [playbooks, models] = await Promise.all([
      base44.asServiceRole.entities.StrategyPlaybook.filter({ id: playbookId }),
      base44.asServiceRole.entities.SavedModel.filter({ id: modelId }),
    ]);

    if (!playbooks?.[0] || !models?.[0]) {
      return Response.json({ error: 'Playbook or model not found' }, { status: 404 });
    }

    const playbook = playbooks[0];
    const model = models[0];
    const steps = JSON.parse(playbook.implementation_steps || '[]');

    // Use LLM to generate customized implementation plan
    const implementationResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a customized implementation plan to apply this proven strategy to a new business model.

PLAYBOOK: ${playbook.title}
STRATEGY: ${playbook.pivot_strategy}

TARGET MODEL: ${model.name}
DESCRIPTION: ${model.description}

GENERIC STEPS:
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Create a JSON response: {
  "customized_steps": ["string with specific actions for this model"],
  "timeline_weeks": "number",
  "required_resources": ["string"],
  "success_indicators": ["string"],
  "risk_mitigation": "string"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          customized_steps: { type: 'array', items: { type: 'string' } },
          timeline_weeks: { type: 'number' },
          required_resources: { type: 'array', items: { type: 'string' } },
          success_indicators: { type: 'array', items: { type: 'string' } },
          risk_mitigation: { type: 'string' },
        },
      },
    });

    // Log application in VisionLog
    await base44.asServiceRole.entities.VisionLog.create({
      session_id: `playbook_${playbookId}_${modelId}_${Date.now()}`,
      agent: 'StrategyExecutor',
      log_type: 'memory',
      message: `Applied strategy playbook "${playbook.title}" to ${model.name}`,
      idea_id: modelId,
      metadata: JSON.stringify({
        playbook_id: playbookId,
        customized: true,
        timeline_weeks: implementationResponse.timeline_weeks,
      }),
    });

    // Update playbook stats
    await base44.asServiceRole.entities.StrategyPlaybook.update(playbookId, {
      times_applied: (parseInt(playbook.times_applied || 0) + 1).toString(),
    });

    return Response.json({
      success: true,
      playbook: playbook.title,
      model: model.name,
      customized_steps: implementationResponse.customized_steps,
      timeline_weeks: implementationResponse.timeline_weeks,
      required_resources: implementationResponse.required_resources,
      success_indicators: implementationResponse.success_indicators,
      risk_mitigation: implementationResponse.risk_mitigation,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});