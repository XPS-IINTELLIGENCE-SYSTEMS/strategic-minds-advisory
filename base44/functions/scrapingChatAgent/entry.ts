import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { userMessage, workspaceId, sessionId } = await req.json();

    // Detect scraping intent in user message
    const scrapingPatterns = [
      /scrape\s+(https?:\/\/[^\s]+)/gi,
      /analyze\s+website?\s+(https?:\/\/[^\s]+)/gi,
      /get\s+data\s+from\s+(https?:\/\/[^\s]+)/gi,
    ];

    let urlsToScrape = [];
    for (const pattern of scrapingPatterns) {
      const matches = userMessage.matchAll(pattern);
      for (const match of matches) {
        urlsToScrape.push(match[1]);
      }
    }

    let scrapingResults = null;

    // If URLs detected, scrape them
    if (urlsToScrape.length > 0) {
      const scrapeRes = await base44.functions.invoke('parallelScraper', {
        urls: urlsToScrape,
        extractionSchema: {
          category: 'competitive',
          domain: new URL(urlsToScrape[0]).hostname,
        },
        workspaceId,
        jobId: `chat-${sessionId}-${Date.now()}`,
      });

      scrapingResults = scrapeRes.data;
    }

    // Build context for LLM
    const recentIntelligence = await base44.asServiceRole.entities.StrategicIntelligence.list('-created_date', 5);

    const contextMessage = `
User: ${userMessage}
${scrapingResults ? `\nScraped Data:\n${JSON.stringify(scrapingResults, null, 2)}\n` : ''}
Recent Intelligence Context:
${recentIntelligence.map(i => `- ${i.title}: ${i.content?.substring(0, 200)}`).join('\n')}
`;

    // Get LLM response
    const chatRes = await base44.functions.invoke('groqChat', {
      messages: [{
        role: 'user',
        content: contextMessage,
      }],
      systemPrompt: `You are a strategic intelligence assistant integrated with web scraping capabilities. 
When users ask you to scrape websites, you receive the data and analyze it in context of recent market intelligence.
Provide actionable insights based on the scraped data and market trends.`,
    });

    // Store in chat memory
    await base44.asServiceRole.entities.ChatMemory.create({
      workspace_id: workspaceId,
      user_email: user.email,
      session_id: sessionId,
      messages: JSON.stringify([
        { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
        { role: 'assistant', content: chatRes.data.content, timestamp: new Date().toISOString() },
      ]),
      context: JSON.stringify({
        urlsScraped: urlsToScrape,
        scrapingJobId: scrapingResults?.jobId,
        intelligenceCount: recentIntelligence.length,
      }),
    });

    return Response.json({
      assistantMessage: chatRes.data.content,
      scrapingResults: scrapingResults || null,
      urlsProcessed: urlsToScrape.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat scraping error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});