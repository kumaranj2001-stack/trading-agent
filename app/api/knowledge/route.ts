import { NextRequest, NextResponse } from 'next/server';
import { TECHNICAL_KNOWLEDGE_BASE } from '@/lib/knowledge/technicalKnowledge';
import { FUNDAMENTAL_KNOWLEDGE_BASE } from '@/lib/knowledge/fundamentalKnowledge';
import { knowledgeEngine } from '@/lib/knowledge/KnowledgeEngine';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const query = searchParams.get('query')?.toLowerCase();

    let rules = [...TECHNICAL_KNOWLEDGE_BASE, ...FUNDAMENTAL_KNOWLEDGE_BASE];

    if (category === 'TECHNICAL') {
      rules = TECHNICAL_KNOWLEDGE_BASE;
    } else if (category === 'FUNDAMENTAL') {
      rules = FUNDAMENTAL_KNOWLEDGE_BASE;
    } else if (category === 'INDIAN_MARKET') {
      rules = rules.filter(r => r.marketScope === 'INDIAN_MARKET');
    }

    if (query) {
      rules = rules.filter(r => 
        r.ruleName.toLowerCase().includes(query) ||
        r.conditionDescription.toLowerCase().includes(query) ||
        r.subcategory.toLowerCase().includes(query)
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
      { success: false, error: error.message || 'Knowledge query failed' },
      { status: 500 }
    );
  }
}
