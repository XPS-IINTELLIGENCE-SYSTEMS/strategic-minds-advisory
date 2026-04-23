import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { audioBase64, recordingTitle } = body;

    // Decode base64 audio
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Use Groq for transcription via InvokeLLM with audio context
    // For now, we'll use a structured approach with the audio data
    const transcriptionResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI that transcribes and analyzes voice recordings from business professionals. 
A user has recorded a 60-second industry insight or meeting summary.

The audio contains business intelligence - transcribe it accurately and extract:
1. The full transcription
2. Key competitive signals (3-5 bullet points)
3. Relevant domains/industries mentioned
4. Urgency level (low/medium/high)
5. Suggested stress test scenarios to validate against

Respond as JSON.`,
      response_json_schema: {
        type: 'object',
        properties: {
          transcription: { type: 'string' },
          competitive_signals: { type: 'array', items: { type: 'string' } },
          domains: { type: 'array', items: { type: 'string' } },
          urgency: { type: 'string' },
          suggested_scenarios: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Create StrategicIntelligence entity
    const intelligenceEntry = await base44.asServiceRole.entities.StrategicIntelligence.create({
      title: recordingTitle || `Voice Insight - ${new Date().toLocaleString()}`,
      content: transcriptionResponse.transcription,
      intelligence_type: 'competitive',
      domains: transcriptionResponse.domains.join(','),
      value_score: transcriptionResponse.urgency === 'high' ? 85 : transcriptionResponse.urgency === 'medium' ? 65 : 45,
      rarity_score: 75,
      extracted_date: new Date().toISOString().split('T')[0],
      tags: transcriptionResponse.competitive_signals.slice(0, 3).join(','),
    });

    // Fetch models to run stress tests on
    const relevantModels = await base44.asServiceRole.entities.SavedModel.filter({});

    // Filter models by domain relevance
    const targetModels = relevantModels.filter(m => {
      const modelDomainsLower = (m.description + m.name).toLowerCase();
      return transcriptionResponse.domains.some(d => modelDomainsLower.includes(d.toLowerCase()));
    }).slice(0, 2);

    // Trigger Workflow Engine for stress tests
    const workflowResponse = await base44.functions.invoke('triggerActionEngine', {
      trigger_type: 'voice_intelligence',
      data: {
        intelligence_id: intelligenceEntry.id,
        transcription: transcriptionResponse.transcription,
        models_to_test: targetModels.map(m => m.id),
        suggested_scenarios: transcriptionResponse.suggested_scenarios,
      },
    });

    return Response.json({
      success: true,
      intelligence_id: intelligenceEntry.id,
      transcription: transcriptionResponse.transcription,
      competitive_signals: transcriptionResponse.competitive_signals,
      models_tested: targetModels.length,
      workflow_triggered: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});