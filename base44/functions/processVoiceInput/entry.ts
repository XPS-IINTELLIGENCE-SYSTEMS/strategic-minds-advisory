import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcript } = await req.json();

    if (!transcript?.trim()) {
      return Response.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Use Groq to analyze the voice input
    const analysisRes = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this voice input and determine if it's a strategy discussion for debate history or a task.
      
Voice input: "${transcript}"

Respond with JSON: { "type": "debate" | "task", "title": string, "content": string, "domain": string | null }`,
      response_json_schema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['debate', 'task'] },
          title: { type: 'string' },
          content: { type: 'string' },
          domain: { type: 'string' },
        },
        required: ['type', 'title', 'content'],
      },
    });

    const analysis = analysisRes;

    if (analysis.type === 'debate') {
      // Create debate history entry
      await base44.entities.DebateHistory.create({
        idea_id: 'voice_input_' + Date.now(),
        session_id: 'voice_' + Date.now(),
        title: analysis.title,
        messages: JSON.stringify([
          {
            agent: 'User Voice Input',
            content: transcript,
            timestamp: new Date().toISOString(),
          },
        ]),
        conclusion: analysis.content,
        decision_made: analysis.title,
        debate_date: new Date().toISOString(),
        participants: 'User Voice Input',
        tags: 'voice-input,mobile',
      });
    } else {
      // Create task
      await base44.entities.DecisionTask.create({
        debate_id: 'voice_' + Date.now(),
        decision: analysis.title,
        tasks: JSON.stringify([
          {
            title: analysis.title,
            description: analysis.content,
            priority: 'medium',
            status: 'created',
          },
        ]),
        status: 'created',
      });
    }

    return Response.json({
      success: true,
      type: analysis.type,
      title: analysis.title,
    });
  } catch (error) {
    console.error('Voice input error:', error);
    return Response.json(
      { error: error.message || 'Failed to process voice input' },
      { status: 500 }
    );
  }
});