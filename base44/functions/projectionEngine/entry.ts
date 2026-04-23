import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function generateMonthlyProjection(scenario, assumptions, months) {
  const growth = {
    conservative: 0.05,
    baseline: 0.15,
    aggressive: 0.30,
  }[scenario] || 0.15;

  const monthlyData = [];
  let revenue = assumptions.initialRevenue / 12;
  let cumulativeCashFlow = 0;

  for (let i = 1; i <= months; i++) {
    const monthlyRevenue = revenue * Math.pow(1 + growth, i / 12);
    const monthlyOpex = monthlyRevenue * assumptions.opexPercent;
    const churnImpact = monthlyRevenue * assumptions.churnRate;
    const netIncome = monthlyRevenue - monthlyOpex;
    const cashFlow = netIncome - churnImpact;
    cumulativeCashFlow += cashFlow;

    monthlyData.push({
      month: `M${i}`,
      revenue: Math.round(monthlyRevenue),
      income: Math.round(netIncome),
      costs: Math.round(monthlyOpex),
      cashFlow: Math.round(cashFlow),
      cumulativeCashFlow: Math.round(cumulativeCashFlow),
    });
  }

  return monthlyData;
}

function calculateSummary(monthlyData, assumptions) {
  const year1Revenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const avgMonthlyGrowth = ((monthlyData[11].revenue - monthlyData[0].revenue) / monthlyData[0].revenue / 11) * 100;
  const peakCashFlow = Math.max(...monthlyData.map(m => m.cumulativeCashFlow));
  const profitabilityMonth = monthlyData.find(m => m.cumulativeCashFlow > 0)?.month || 'Beyond 12 months';

  return {
    year1Revenue,
    avgMonthlyGrowth,
    peakCashFlow,
    profitabilityMonth,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenario, assumptions, months } = await req.json();

    const monthlyProjection = generateMonthlyProjection(scenario, assumptions, months || 12);
    const summary = calculateSummary(monthlyProjection, assumptions);

    return Response.json({
      success: true,
      monthlyProjection,
      summary,
      scenario,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});