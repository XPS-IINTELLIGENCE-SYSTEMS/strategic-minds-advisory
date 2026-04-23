import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      domain = 'all',
      sources = ['sec_filings', 'press_releases', 'news'],
      limit = 50,
    } = body;

    const brightdataApiKey = Deno.env.get('BRIGHTDATA_API_KEY');
    if (!brightdataApiKey) {
      return Response.json({ error: 'BRIGHTDATA_API_KEY not configured' }, { status: 400 });
    }

    const scrapedData = [];

    // Scrape SEC filings
    if (sources.includes('sec_filings')) {
      try {
        const secData = await scrapeSecFilings(brightdataApiKey, domain, limit);
        scrapedData.push(...secData);
      } catch (e) {
        console.error('SEC scraping failed:', e);
      }
    }

    // Scrape press releases
    if (sources.includes('press_releases')) {
      try {
        const prData = await scrapePressReleases(brightdataApiKey, domain, limit);
        scrapedData.push(...prData);
      } catch (e) {
        console.error('Press release scraping failed:', e);
      }
    }

    // Scrape industry news
    if (sources.includes('news')) {
      try {
        const newsData = await scrapeIndustryNews(brightdataApiKey, domain, limit);
        scrapedData.push(...newsData);
      } catch (e) {
        console.error('News scraping failed:', e);
      }
    }

    // Ingest into Vision Cortex
    const ingestionResults = [];
    for (const item of scrapedData) {
      try {
        // Parse with LLM for structured analysis
        const analysisResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this market intelligence item and extract key insights:

TITLE: ${item.title}
SOURCE: ${item.source}
CONTENT: ${item.content.substring(0, 500)}

Provide JSON with:
1. intelligence_type: competitive|market_trend|risk|opportunity|technology
2. key_finding: brief summary
3. domains: comma-separated relevant industries
4. value_score: 0-100 estimated value
5. rarity_score: 0-100 how unique/difficult to find`,
          response_json_schema: {
            type: 'object',
            properties: {
              intelligence_type: { type: 'string' },
              key_finding: { type: 'string' },
              domains: { type: 'string' },
              value_score: { type: 'number' },
              rarity_score: { type: 'number' },
            },
          },
        });

        // Create StrategicIntelligence record
        const intelRecord = await base44.asServiceRole.entities.StrategicIntelligence.create({
          title: item.title,
          content: item.content,
          intelligence_type: analysisResponse.intelligence_type,
          domains: analysisResponse.domains,
          source_ids: item.source,
          value_score: analysisResponse.value_score,
          rarity_score: analysisResponse.rarity_score,
          extracted_date: new Date().toISOString(),
          tags: `automated_scrape,${item.source_type},${domain}`,
          is_premium_only: analysisResponse.value_score > 75,
        });

        ingestionResults.push({
          title: item.title,
          ingested: true,
          record_id: intelRecord.id,
        });
      } catch (e) {
        console.error(`Failed to ingest ${item.title}:`, e);
        ingestionResults.push({
          title: item.title,
          ingested: false,
          error: e.message,
        });
      }
    }

    return Response.json({
      success: true,
      items_scraped: scrapedData.length,
      items_ingested: ingestionResults.filter(r => r.ingested).length,
      domain,
      sources_used: sources,
      ingestion_results: ingestionResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function scrapeSecFilings(apiKey, domain, limit) {
  // Using BRIGHTDATA_API_KEY for SEC Edgar scraping
  // Returns mock data structure for demonstration
  const filings = [];

  try {
    const response = await fetch('https://api.brightdata.com/v3/residential', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.sec.gov/cgi-bin/browse-edgar',
        limit,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Parse SEC data
      return data.filings?.map(f => ({
        title: f.company_name + ' - ' + f.form_type,
        source: 'SEC Edgar',
        source_type: 'sec_filings',
        content: f.filing_summary || '',
        url: f.filing_url,
      })) || [];
    }
  } catch (e) {
    console.error('SEC scraping error:', e);
  }

  return filings;
}

async function scrapePressReleases(apiKey, domain, limit) {
  const releases = [];

  try {
    const response = await fetch('https://api.brightdata.com/v3/residential', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.prnewswire.com/',
        domain_filter: domain,
        limit,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.releases?.map(r => ({
        title: r.headline,
        source: 'PR Newswire',
        source_type: 'press_releases',
        content: r.body,
        url: r.url,
      })) || [];
    }
  } catch (e) {
    console.error('Press release scraping error:', e);
  }

  return releases;
}

async function scrapeIndustryNews(apiKey, domain, limit) {
  const news = [];

  try {
    const response = await fetch('https://api.brightdata.com/v3/residential', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://www.techcrunch.com/',
        domain_filter: domain,
        limit,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.articles?.map(a => ({
        title: a.title,
        source: a.publication,
        source_type: 'news',
        content: a.content,
        url: a.url,
        published_date: a.published_date,
      })) || [];
    }
  } catch (e) {
    console.error('News scraping error:', e);
  }

  return news;
}