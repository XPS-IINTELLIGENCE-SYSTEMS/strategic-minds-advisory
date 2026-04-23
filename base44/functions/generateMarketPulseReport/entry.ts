import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all intelligence from past 14 days
    const allIntelligence = await base44.asServiceRole.entities.StrategicIntelligence.list();
    const recentIntelligence = allIntelligence.filter(item => {
      const itemDate = new Date(item.extracted_date);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return itemDate >= twoWeeksAgo;
    });

    // Group by intelligence type
    const byType = {};
    recentIntelligence.forEach(item => {
      if (!byType[item.intelligence_type]) byType[item.intelligence_type] = [];
      byType[item.intelligence_type].push(item);
    });

    // Fetch competitor benchmarks for context
    const benchmarks = await base44.asServiceRole.entities.CompetitorBenchmark.list();

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Market Pulse Report', pageWidth / 2, yPos, { align: 'center' });

    yPos += 12;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Two-Week Intelligence Summary · ${reportDate}`, pageWidth / 2, yPos, { align: 'center' });

    yPos += 18;

    // Executive Summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Executive Summary', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const summaryText = `Over the past two weeks, our intelligence system has ingested ${recentIntelligence.length} strategic signals across market trends, competitive moves, and emerging risks. Key themes include sector rotation patterns, regulatory shifts, and disruptive technologies.`;
    const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 40);
    doc.text(summaryLines, 20, yPos);
    yPos += summaryLines.length * 5 + 10;

    // Intelligence by Type
    const types = Object.keys(byType).sort();
    for (const type of types) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      const typeLabel = type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1);
      doc.text(`${typeLabel} (${byType[type].length} items)`, 20, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      const itemsToShow = byType[type].slice(0, 5);
      for (const item of itemsToShow) {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont(undefined, 'bold');
        const titleLines = doc.splitTextToSize(`• ${item.title}`, pageWidth - 40);
        doc.text(titleLines, 20, yPos);
        yPos += titleLines.length * 4;

        doc.setFont(undefined, 'normal');
        const contentLines = doc.splitTextToSize(item.content.substring(0, 150) + '...', pageWidth - 45);
        doc.text(contentLines, 25, yPos);
        yPos += contentLines.length * 4 + 4;
      }

      yPos += 6;
    }

    // Competitor Benchmarks Section
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Competitive Benchmarks', 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    if (benchmarks.length > 0) {
      const benchmark = benchmarks[0];
      const benchmarkText = `Domain: ${benchmark.domain} | Business Model: ${benchmark.business_model} | Avg CAC: $${benchmark.avg_cac} | Growth Rate: ${benchmark.avg_growth_rate}% | LTV:CAC Ratio: ${benchmark.avg_ltv_cac_ratio}`;
      const benchmarkLines = doc.splitTextToSize(benchmarkText, pageWidth - 40);
      doc.text(benchmarkLines, 20, yPos);
      yPos += benchmarkLines.length * 5 + 6;
    }

    // Risk Assessment
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Key Risks & Opportunities', 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const riskItems = recentIntelligence.filter(i => ['risk', 'opportunity'].includes(i.intelligence_type)).slice(0, 5);
    if (riskItems.length > 0) {
      for (const item of riskItems) {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        const riskLines = doc.splitTextToSize(`• ${item.title}: ${item.content.substring(0, 100)}...`, pageWidth - 40);
        doc.text(riskLines, 20, yPos);
        yPos += riskLines.length * 4 + 3;
      }
    } else {
      doc.text('No critical risks flagged this period.', 20, yPos);
      yPos += 6;
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Strategic Minds Advisory · Confidential', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save and return
    const pdfData = doc.output('arraybuffer');
    const fileName = `MarketPulse_${new Date().toISOString().split('T')[0]}.pdf`;

    return new Response(pdfData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});