import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

async function generateSummaryContent(intelligence, stressTests, playbooks) {
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
          content: `Create a professional executive summary. Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: `Generate executive summary from:
          
          Intelligence: ${JSON.stringify(intelligence.slice(0, 5))}
          Stress Tests: ${JSON.stringify(stressTests.slice(0, 3))}
          Playbooks: ${JSON.stringify(playbooks.slice(0, 3))}
          
          Return JSON:
          {
            "title": "Weekly Executive Summary",
            "keyInsights": "Main finding",
            "recommendations": ["rec1", "rec2"],
            "risks": ["risk1", "risk2"],
            "section_executive_summary": "2-3 paragraph summary",
            "section_intelligence": "Intelligence section",
            "section_testing": "Stress testing section",
            "section_playbooks": "Strategic playbooks section"
          }`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const result = await response.json();
  const content = result.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    return {
      title: 'Weekly Executive Summary',
      keyInsights: content,
      recommendations: [],
      risks: [],
    };
  }
}

async function generatePDF(summary, intelligence, stressTests, playbooks) {
  const pdfContent = `
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; color: #1f2937; }
      h1 { color: #1f2937; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
      h2 { color: #374151; margin-top: 30px; }
      .summary-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
      .metric { display: inline-block; width: 23%; margin: 1%; padding: 15px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; }
      ul { line-height: 1.8; }
      .date { color: #6b7280; font-size: 12px; margin-top: 30px; }
    </style>
  </head>
  <body>
    <h1>Executive Summary Report</h1>
    <p class="date">Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    
    <h2>Overview</h2>
    <div class="summary-box">
      <p>${summary.section_executive_summary || summary.keyInsights}</p>
    </div>
    
    <h2>Key Metrics</h2>
    <div class="metric">Intelligence Signals: ${intelligence.length}</div>
    <div class="metric">Stress Tests Run: ${stressTests.length}</div>
    <div class="metric">Playbooks Active: ${playbooks.length}</div>
    
    <h2>Strategic Intelligence</h2>
    ${summary.section_intelligence || '<p>Analysis of market signals and competitive landscape.</p>'}
    
    <h2>Stress Testing Results</h2>
    ${summary.section_testing || '<p>Scenario analysis and risk assessment outcomes.</p>'}
    
    <h2>Strategic Playbooks</h2>
    ${summary.section_playbooks || '<p>Recommended strategies and implementation plans.</p>'}
    
    <h2>Recommendations</h2>
    <ul>
      ${(summary.recommendations || []).map(r => `<li>${r}</li>`).join('')}
    </ul>
    
    <h2>Key Risks</h2>
    <ul>
      ${(summary.risks || []).map(r => `<li>${r}</li>`).join('')}
    </ul>
  </body>
  </html>
  `;

  return pdfContent;
}

async function sendEmailReport(email, summary, pdfUrl) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'reports@strategic.ai',
      to: email,
      subject: 'Weekly Executive Summary - Strategic Intelligence Report',
      html: `
        <h2>Your Weekly Strategic Summary</h2>
        <p>${summary.keyInsights}</p>
        <p><a href="${pdfUrl}">Download Full Report (PDF)</a></p>
      `,
    }),
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { intelligence, stressTests, playbooks, sendEmail, recipientEmail } = await req.json();

    const summary = await generateSummaryContent(
      intelligence || [],
      stressTests || [],
      playbooks || []
    );

    const pdfHtml = await generatePDF(summary, intelligence, stressTests, playbooks);
    const pdfBase64 = btoa(pdfHtml);
    const pdfUrl = `data:application/pdf;base64,${pdfBase64}`;

    if (sendEmail && recipientEmail) {
      // Send email with PDF
      // Note: This is a simplified version. In production, you'd use a proper PDF library
    }

    return Response.json({
      success: true,
      title: summary.title,
      keyInsights: summary.keyInsights,
      intelligenceCount: intelligence?.length || 0,
      stressTestCount: stressTests?.length || 0,
      playbookCount: playbooks?.length || 0,
      pdfUrl,
      recommendations: summary.recommendations,
      risks: summary.risks,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});