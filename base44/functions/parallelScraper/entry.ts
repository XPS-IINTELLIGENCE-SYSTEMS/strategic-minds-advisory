import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { urls, extractionSchema, jobId, workspaceId } = await req.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      return Response.json({ error: 'No URLs provided' }, { status: 400 });
    }

    // Create scraping job record
    const job = await base44.asServiceRole.entities.ScrapingJob.create({
      workspace_id: workspaceId,
      user_email: user.email,
      job_id: jobId,
      urls: JSON.stringify(urls),
      status: 'running',
      started_at: new Date().toISOString(),
      total_urls: urls.length,
      completed_urls: 0,
    });

    // Parallel fetch all URLs
    const scrapePromises = urls.map(async (url) => {
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Strategic-Minds-Scraper/1.0)' },
          signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
          return { url, success: false, error: `HTTP ${response.status}` };
        }

        const html = await response.text();

        // Extract structured data based on schema
        const extracted = extractData(html, extractionSchema);

        // Store result in strategic_intelligence
        await base44.asServiceRole.entities.StrategicIntelligence.create({
          workspace_id: workspaceId,
          source: 'web_scraper',
          category: extractionSchema.category || 'competitive',
          title: extracted.title || `Scraped: ${url}`,
          content: extracted.content || html.substring(0, 2000),
          impact_score: extracted.impact_score || 50,
          sentiment: extracted.sentiment || 'neutral',
          source_url: url,
          relevant_domains: extractionSchema.domain || url.split('/')[2],
        });

        return { url, success: true, extracted };
      } catch (error) {
        return { url, success: false, error: error.message };
      }
    });

    const results = await Promise.all(scrapePromises);

    const successCount = results.filter(r => r.success).length;

    // Update job status
    await base44.asServiceRole.entities.ScrapingJob.update(job.id, {
      status: 'completed',
      completed_urls: successCount,
      results: JSON.stringify(results),
      completed_at: new Date().toISOString(),
    });

    return Response.json({
      jobId: job.id,
      totalUrls: urls.length,
      successCount,
      failureCount: urls.length - successCount,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function extractData(html, schema) {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const extracted = {
    title: schema.titleSelector ? doc.querySelector(schema.titleSelector)?.textContent?.trim() : '',
    content: schema.contentSelector ? doc.querySelector(schema.contentSelector)?.textContent?.trim() : '',
    impact_score: 75,
    sentiment: 'neutral',
  };

  // Simple keyword extraction for sentiment
  const keywords = {
    positive: ['growth', 'success', 'expand', 'increase', 'profit'],
    negative: ['decline', 'loss', 'risk', 'failed', 'decrease'],
  };

  const text = extracted.content.toLowerCase();
  const posCount = keywords.positive.filter(k => text.includes(k)).length;
  const negCount = keywords.negative.filter(k => text.includes(k)).length;

  if (posCount > negCount) extracted.sentiment = 'positive';
  else if (negCount > posCount) extracted.sentiment = 'negative';

  return extracted;
}