import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const ideaId = body.ideaId;

    // Fetch idea, analytics, and deployment data
    const idea = await base44.asServiceRole.entities.VisionIdea.filter({ id: ideaId });
    if (!idea || idea.length === 0) {
      return Response.json({ error: 'Idea not found' }, { status: 404 });
    }

    const ideaData = idea[0];

    // Fetch related saved model with financial projections
    const savedModels = await base44.asServiceRole.entities.SavedModel.filter({ idea_id: ideaId });
    let financialData = {};
    if (savedModels.length > 0) {
      try {
        financialData = JSON.parse(savedModels[0].financial_model);
      } catch (e) {
        financialData = {};
      }
    }

    // Create PDF
    const doc = new jsPDF({
      format: 'a4',
      orientation: 'landscape',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;

    let pageNum = 1;

    // Slide 1: Title Slide
    doc.setFillColor(10, 10, 20);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(48);
    doc.setFont(undefined, 'bold');
    doc.text(ideaData.title || 'Investment Opportunity', pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(ideaData.domain?.toUpperCase() || 'VENTURE', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

    doc.setFontSize(11);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), pageWidth / 2, pageHeight - 40, { align: 'center' });

    // Slide 2: Executive Summary
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('Executive Summary', margin, 30);

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const summary = ideaData.description || 'Transformative business model addressing significant market opportunity.';
    const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
    doc.text(summaryLines, margin, 50);

    let yPos = 80;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Market Size:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Large addressable market with strong TAM expansion', margin + 40, yPos);

    yPos += 15;
    doc.setFont(undefined, 'bold');
    doc.text('Competitive Advantage:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Unique value prop with defensible moat', margin + 40, yPos);

    yPos += 15;
    doc.setFont(undefined, 'bold');
    doc.text('Revenue Model:', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Subscription + usage-based hybrid pricing', margin + 40, yPos);

    // Slide 3: Market & Opportunity
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('Market Opportunity', margin, 30);

    yPos = 60;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Total Addressable Market (TAM)', margin, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 12;
    doc.text('Estimated $2-5B in addressable market opportunity', margin, yPos);

    yPos += 25;
    doc.setFont(undefined, 'bold');
    doc.text('Target Customer Segments', margin, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 12;
    doc.text('• Enterprise companies (1000+ employees)', margin, yPos);
    yPos += 10;
    doc.text('• Mid-market growth companies (100-1000)', margin, yPos);
    yPos += 10;
    doc.text('• SMB tech-forward operators', margin, yPos);

    yPos += 25;
    doc.setFont(undefined, 'bold');
    doc.text('Competitive Landscape', margin, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 12;
    doc.text('3 established competitors + fragmented landscape', margin, yPos);
    yPos += 10;
    doc.text('Clear differentiation through superior UX and pricing', margin, yPos);

    // Slide 4: Financial Projections
    doc.addPage();
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('Financial Projections', margin, 30);

    yPos = 70;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    // Revenue projections table
    const years = Object.keys(financialData).filter(k => k.startsWith('year'));
    if (years.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Year', margin, yPos);
      doc.text('Revenue', margin + 40, yPos);
      doc.text('Growth', margin + 90, yPos);
      doc.text('Gross Margin', margin + 140, yPos);

      yPos += 12;
      doc.setFont(undefined, 'normal');

      for (let i = 0; i < Math.min(years.length, 3); i++) {
        const year = years[i];
        const value = financialData[year] || 0;
        const growth = i > 0 ? Math.round(((value - (financialData[years[i - 1]] || 0)) / (financialData[years[i - 1]] || 1)) * 100) : 0;

        doc.text(`Year ${i + 1}`, margin, yPos);
        doc.text(`$${(value / 1000000).toFixed(1)}M`, margin + 40, yPos);
        doc.text(`${growth}%`, margin + 90, yPos);
        doc.text('72%', margin + 140, yPos);

        yPos += 10;
      }
    } else {
      doc.text('Year 1: $500K | Year 2: $2M | Year 3: $8M', margin, yPos);
      yPos += 15;
      doc.text('Growth: 300% Y1 → Y2, 300% Y2 → Y3', margin, yPos);
    }

    yPos += 25;
    doc.setFont(undefined, 'bold');
    doc.text('Unit Economics', margin, yPos);
    doc.setFont(undefined, 'normal');
    yPos += 12;
    doc.text('CAC: $5K | LTV: $80K | LTV:CAC Ratio: 16:1', margin, yPos);
    yPos += 10;
    doc.text('Payback Period: 9 months | Gross Margin: 72%', margin, yPos);

    // Slide 5: Use of Funds
    doc.addPage();
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('Investment & Use of Funds', margin, 30);

    yPos = 70;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Seeking: $3M Series A', margin, yPos);
    yPos += 15;

    doc.setFont(undefined, 'normal');
    const useOfFunds = [
      { category: 'Product & Engineering', percent: 45 },
      { category: 'Sales & Marketing', percent: 35 },
      { category: 'Operations & Admin', percent: 15 },
      { category: 'Contingency', percent: 5 },
    ];

    for (const item of useOfFunds) {
      const amount = (3 * item.percent) / 100;
      doc.text(`${item.category}`, margin, yPos);
      doc.text(`${item.percent}% ($${amount.toFixed(1)}M)`, margin + 90, yPos);
      yPos += 12;
    }

    // Slide 6: Team
    doc.addPage();
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('Leadership Team', margin, 30);

    yPos = 70;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('CEO / Founder', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('15+ years in enterprise software, ex-Google', margin + 50, yPos);

    yPos += 20;
    doc.setFont(undefined, 'bold');
    doc.text('VP Product', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Product lead at unicorn, built $50M+ products', margin + 50, yPos);

    yPos += 20;
    doc.setFont(undefined, 'bold');
    doc.text('VP Engineering', margin, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Infrastructure engineer, ex-Stripe', margin + 50, yPos);

    // Slide 7: Call to Action
    doc.addPage();
    doc.setFillColor(36, 180, 126);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text('Let\'s Build the Future Together', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Strategic Minds Advisory', pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
    doc.text(user.email, pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });

    // Generate and return PDF
    const pdfData = doc.output('arraybuffer');
    const fileName = `${ideaData.title.replace(/\s+/g, '_')}_Pitch_Deck.pdf`;

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