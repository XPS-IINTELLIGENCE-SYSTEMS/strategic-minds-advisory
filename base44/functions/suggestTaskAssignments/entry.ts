import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

async function suggestAssignments(tasks, teamMembers) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a project manager optimizing task assignments. Return ONLY valid JSON.
          Consider skills match, workload, and expertise.`,
        },
        {
          role: 'user',
          content: `Suggest optimal task assignments:
          
          Tasks: ${JSON.stringify(tasks)}
          Team: ${JSON.stringify(teamMembers.map(m => ({ 
            name: m.full_name, 
            skills: m.skills, 
            capacity: m.capacity, 
            current_tasks: m.current_tasks 
          })))}
          
          Return:
          {
            "assignments": { "task_title": "member_name" },
            "recommendations": [
              {
                "task": "task name",
                "recommended_member": "name",
                "match_percentage": 85,
                "reason": "reason",
                "alternatives": ["alt1"],
                "risks": ["risk1"]
              }
            ],
            "overallScore": 78
          }`,
        },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    }),
  });

  const result = await response.json();
  const content = result.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    return {
      assignments: {},
      recommendations: [],
      overallScore: 70,
    };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tasks, teamMembers, decisionId } = await req.json();

    if (!tasks || !teamMembers) {
      return Response.json({ error: 'Missing tasks or team members' }, { status: 400 });
    }

    const suggestions = await suggestAssignments(tasks, teamMembers);

    return Response.json({ success: true, ...suggestions });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});