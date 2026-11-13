import { NextRequest, NextResponse } from 'next/server';
import { knowledgeEngine } from '@/lib/knowledge/KnowledgeEngine';
import { diagnosticReasoningEngine } from '@/lib/diagnosticReasoningEngine';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const rawQuery = searchParams.get('query') || '';

    // Bound query length to 100 characters to prevent ReDoS / CPU spike
    const query = rawQuery.slice(0, 100).toLowerCase().trim();

    let rules = knowledgeEngine.getAllRules();

    if (category === 'TECHNICAL') {
      rules = knowledgeEngine.getTechnicalRules();
    } else if (category === 'FUNDAMENTAL') {
      rules = knowledgeEngine.getFundamentalRules();
    } else if (category === 'DYNAMIC_CONSTRAINTS' || category === 'FAILURE_CONSTRAINTS' || category === 'SYNTHESIZED_RULES') {
      rules = diagnosticReasoningEngine.getDynamicRules() as any;
    } else if (category === 'INDIAN_MARKET') {
      rules = rules.filter(r => r.marketScope === 'INDIAN_MARKET');
    }

    if (query.length > 0) {
      rules = rules.filter(r => 
        r.ruleName.toLowerCase().includes(query) ||
        r.conditionDescription.toLowerCase().includes(query) ||
        r.subcategory.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    }

    const stats = knowledgeEngine.getTotalStats();

    return NextResponse.json({
      success: true,
      data: {
        stats,
        totalReturned: rules.length,
        rules: rules.slice(0, 100),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Knowledge query failed' },
      { status: 500 }
    );
  }
}
