import { CurrencyPair, MarketSegment } from './types';

// ============================================================================
// DETERMINISTIC ENTITY EXTRACTION & TICKER MAPPING DICTIONARY
// Rule-based, zero-AI pattern matching engine
// ============================================================================

export interface ExtractedEntity {
  category: 'CENTRAL_BANK' | 'POLICY_MAKER' | 'FINANCIAL_INSTRUMENT' | 'MACRO_INDICATOR' | 'GEOPOLITICAL_BODY';
  entityName: string;
  matchedTokens: string[];
  mappedTickers: CurrencyPair[];
  relevanceWeight: number; // 0 to 1.0
}

export interface EntityExtractionResult {
  rawText: string;
  extractedEntities: ExtractedEntity[];
  mappedTickers: CurrencyPair[];
  dominantInstrument: CurrencyPair | null;
  primaryCentralBank: string | null;
  primaryPolicymaker: string | null;
  matchedKeywords: string[];
}

interface EntityRule {
  name: string;
  category: ExtractedEntity['category'];
  patterns: RegExp[];
  tickers: CurrencyPair[];
  weight: number;
}

const ENTITY_RULES: EntityRule[] = [
  // 1. Central Banks
  {
    name: 'Federal Reserve (Fed)',
    category: 'CENTRAL_BANK',
    patterns: [/\bfed\b/i, /\bfederal reserve\b/i, /\bfomc\b/i, /\bcentral bank of the united states\b/i],
    tickers: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'USD/INR'],
    weight: 1.0,
  },
  {
    name: 'European Central Bank (ECB)',
    category: 'CENTRAL_BANK',
    patterns: [/\becb\b/i, /\beuropean central bank\b/i, /\beurotower\b/i, /\beurosystem\b/i],
    tickers: ['EUR/USD', 'EUR/GBP'],
    weight: 0.95,
  },
  {
    name: 'Bank of Japan (BoJ)',
    category: 'CENTRAL_BANK',
    patterns: [/\bboj\b/i, /\bbank of japan\b/i, /\bycc\b/i, /\byield curve control\b/i, /\bnichigin\b/i],
    tickers: ['USD/JPY'],
    weight: 0.95,
  },
  {
    name: 'Bank of England (BoE)',
    category: 'CENTRAL_BANK',
    patterns: [/\bboe\b/i, /\bbank of england\b/i, /\bmonetary policy committee\b/i, /\bmpc\b/i, /\bthreadneedle street\b/i],
    tickers: ['GBP/USD', 'EUR/GBP'],
    weight: 0.90,
  },
  {
    name: 'Swiss National Bank (SNB)',
    category: 'CENTRAL_BANK',
    patterns: [/\bsnb\b/i, /\bswiss national bank\b/i, /\bschweizerische nationalbank\b/i],
    tickers: ['EUR/USD', 'USD/CHF', 'USD/JPY'],
    weight: 0.85,
  },
  {
    name: 'Reserve Bank of India (RBI)',
    category: 'CENTRAL_BANK',
    patterns: [/\brbi\b/i, /\breserve bank of india\b/i, /\bmint street\b/i, /\bdas\b/i],
    tickers: ['USD/INR', 'NIFTY 50', 'BANK NIFTY'],
    weight: 0.95,
  },
  {
    name: "People's Bank of China (PBoC)",
    category: 'CENTRAL_BANK',
    patterns: [/\bpboc\b/i, /\bpeople's bank of china\b/i, /\bpeoples bank of china\b/i, /\blpr\b/i, /\bloan prime rate\b/i],
    tickers: ['XAU/USD', 'WTI_CRUDE', 'USD/JPY'],
    weight: 0.90,
  },

  // 2. Key Policymakers
  {
    name: 'Jerome Powell (Fed Chair)',
    category: 'POLICY_MAKER',
    patterns: [/\bpowell\b/i, /\bjerome powell\b/i, /\bchair powell\b/i],
    tickers: ['EUR/USD', 'USD/JPY', 'XAU/USD'],
    weight: 1.0,
  },
  {
    name: 'Christine Lagarde (ECB President)',
    category: 'POLICY_MAKER',
    patterns: [/\blagarde\b/i, /\bchristine lagarde\b/i, /\bpresident lagarde\b/i],
    tickers: ['EUR/USD', 'EUR/GBP'],
    weight: 0.95,
  },
  {
    name: 'Kazuo Ueda (BoJ Governor)',
    category: 'POLICY_MAKER',
    patterns: [/\bueda\b/i, /\bkazuo ueda\b/i, /\bgovernor ueda\b/i],
    tickers: ['USD/JPY'],
    weight: 0.95,
  },
  {
    name: 'Andrew Bailey (BoE Governor)',
    category: 'POLICY_MAKER',
    patterns: [/\bbailey\b/i, /\bandrew bailey\b/i, /\bgovernor bailey\b/i],
    tickers: ['GBP/USD', 'EUR/GBP'],
    weight: 0.90,
  },
  {
    name: 'Shaktikanta Das (RBI Governor)',
    category: 'POLICY_MAKER',
    patterns: [/\bshaktikanta das\b/i, /\bgovernor das\b/i, /\brbi governor\b/i],
    tickers: ['USD/INR', 'NIFTY 50', 'BANK NIFTY'],
    weight: 0.95,
  },
  {
    name: 'Janet Yellen (US Treasury Secretary)',
    category: 'POLICY_MAKER',
    patterns: [/\byellen\b/i, /\bjanet yellen\b/i, /\btreasury secretary\b/i],
    tickers: ['EUR/USD', 'XAU/USD', 'USD/JPY'],
    weight: 0.85,
  },

  // 3. Financial Instruments & Commodities
  {
    name: 'Spot Gold Bullion',
    category: 'FINANCIAL_INSTRUMENT',
    patterns: [/\bgold\b/i, /\bxau\b/i, /\bbullion\b/i, /\bprecious metals\b/i, /\byellow metal\b/i],
    tickers: ['XAU/USD', 'XAG/USD'],
    weight: 1.0,
  },
  {
    name: 'Spot Silver',
    category: 'FINANCIAL_INSTRUMENT',
    patterns: [/\bsilver\b/i, /\bxag\b/i, /\bwhite metal\b/i],
    tickers: ['XAG/USD', 'XAU/USD'],
    weight: 0.90,
  },
  {
    name: 'Spot Platinum',
    category: 'FINANCIAL_INSTRUMENT',
    patterns: [/\bplatinum\b/i, /\bxpt\b/i],
    tickers: ['XPT/USD', 'XAU/USD'],
    weight: 0.85,
  },
  {
    name: 'WTI Crude Oil',
    category: 'FINANCIAL_INSTRUMENT',
    patterns: [/\bcrude\b/i, /\bwti\b/i, /\boil\b/i, /\bpetroleum\b/i, /\bbarrel\b/i, /\bopec\b/i],
    tickers: ['WTI_CRUDE'],
    weight: 0.95,
  },
  {
    name: 'NIFTY 50 Index',
    category: 'FINANCIAL_INSTRUMENT',
    patterns: [/\bnifty\b/i, /\bnifty 50\b/i, /\bnse\b/i, /\bdalal street\b/i, /\bindian equities\b/i],
    tickers: ['NIFTY 50', 'USD/INR'],
    weight: 0.95,
  },
  {
    name: 'BANK NIFTY Index',
    category: 'FINANCIAL_INSTRUMENT',
    patterns: [/\bbank nifty\b/i, /\bbanknifty\b/i, /\bindian banking\b/i],
    tickers: ['BANK NIFTY', 'NIFTY 50'],
    weight: 0.95,
  },
  {
    name: 'Euro Currency',
    category: 'FINANCIAL_INSTRUMENT',
    patterns: [/\beuro\b/i, /\beur\b/i, /\bsingle currency\b/i, /\beurozone\b/i],
    tickers: ['EUR/USD', 'EUR/GBP'],
    weight: 0.90,
  },
  {
    name: 'British Pound Sterling',
    category: 'FINANCIAL_INSTRUMENT',
    patterns: [/\bpound\b/i, /\bsterling\b/i, /\bquid\b/i, /\bcable\b/i, /\bgbp\b/i],
    tickers: ['GBP/USD', 'EUR/GBP'],
    weight: 0.90,
  },
  {
    name: 'Japanese Yen',
    category: 'FINANCIAL_INSTRUMENT',
    patterns: [/\byen\b/i, /\bjpy\b/i],
    tickers: ['USD/JPY'],
    weight: 0.90,
  },
  {
    name: 'US Dollar (Greenback)',
    category: 'FINANCIAL_INSTRUMENT',
    patterns: [/\bdollar\b/i, /\bgreenback\b/i, /\bdxy\b/i, /\busd\b/i, /\btreasury yields?\b/i],
    tickers: ['EUR/USD', 'USD/JPY', 'GBP/USD', 'XAU/USD'],
    weight: 0.85,
  },

  // 4. Macro Catalysts & Indicators
  {
    name: 'Consumer Price Index (CPI) Inflation',
    category: 'MACRO_INDICATOR',
    patterns: [/\bcpi\b/i, /\binflation\b/i, /\bcore cpi\b/i, /\bpce\b/i, /\bconsumer prices\b/i],
    tickers: ['XAU/USD', 'EUR/USD', 'USD/JPY'],
    weight: 0.95,
  },
  {
    name: 'Non-Farm Payrolls (NFP) & Jobs',
    category: 'MACRO_INDICATOR',
    patterns: [/\bnfp\b/i, /\bnon-farm\b/i, /\bpayrolls\b/i, /\bunemployment rate\b/i, /\bjobless claims\b/i],
    tickers: ['EUR/USD', 'USD/JPY', 'XAU/USD'],
    weight: 0.95,
  },
  {
    name: 'Interest Rate Decision / Yield Policy',
    category: 'MACRO_INDICATOR',
    patterns: [/\brate hike\b/i, /\brate cut\b/i, /\bmonetary tightening\b/i, /\bmonetary easing\b/i, /\bpolicy rate\b/i],
    tickers: ['EUR/USD', 'USD/JPY', 'XAU/USD', 'USD/INR'],
    weight: 0.95,
  },
  {
    name: 'OPEC+ Production Quotas',
    category: 'GEOPOLITICAL_BODY',
    patterns: [/\bopec\b/i, /\bopec\+\b/i, /\bsaudi arabia\b/i, /\boil output\b/i, /\bproduction quota\b/i],
    tickers: ['WTI_CRUDE'],
    weight: 1.0,
  },
];

export class DeterministicEntityExtractor {
  private static instance: DeterministicEntityExtractor;

  private constructor() {}

  public static getInstance(): DeterministicEntityExtractor {
    if (!DeterministicEntityExtractor.instance) {
      DeterministicEntityExtractor.instance = new DeterministicEntityExtractor();
    }
    return DeterministicEntityExtractor.instance;
  }

  /**
   * Deterministically extract structured entities and map terminal tickers
   * without calling any AI / LLM models.
   */
  public extractEntities(text: string): EntityExtractionResult {
    if (!text || typeof text !== 'string') {
      return {
        rawText: '',
        extractedEntities: [],
        mappedTickers: [],
        dominantInstrument: null,
        primaryCentralBank: null,
        primaryPolicymaker: null,
        matchedKeywords: [],
      };
    }

    const matchedEntities: ExtractedEntity[] = [];
    const tickerVotes: Map<CurrencyPair, number> = new Map();
    const matchedTokensSet: Set<string> = new Set();

    let primaryCentralBank: string | null = null;
    let primaryPolicymaker: string | null = null;

    for (const rule of ENTITY_RULES) {
      const tokensFound: string[] = [];
      for (const pattern of rule.patterns) {
        const matches = text.match(pattern);
        if (matches) {
          tokensFound.push(matches[0]);
          matchedTokensSet.add(matches[0].toLowerCase());
        }
      }

      if (tokensFound.length > 0) {
        matchedEntities.push({
          category: rule.category,
          entityName: rule.name,
          matchedTokens: Array.from(new Set(tokensFound)),
          mappedTickers: rule.tickers,
          relevanceWeight: rule.weight,
        });

        if (rule.category === 'CENTRAL_BANK' && !primaryCentralBank) {
          primaryCentralBank = rule.name;
        }
        if (rule.category === 'POLICY_MAKER' && !primaryPolicymaker) {
          primaryPolicymaker = rule.name;
        }

        // Cast ticker votes
        rule.tickers.forEach(t => {
          const prev = tickerVotes.get(t) || 0;
          tickerVotes.set(t, prev + rule.weight * tokensFound.length);
        });
      }
    }

    // Rank mapped tickers
    const sortedTickers = Array.from(tickerVotes.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    const dominantInstrument = sortedTickers.length > 0 ? sortedTickers[0] : null;

    return {
      rawText: text,
      extractedEntities: matchedEntities,
      mappedTickers: sortedTickers,
      dominantInstrument,
      primaryCentralBank,
      primaryPolicymaker,
      matchedKeywords: Array.from(matchedTokensSet),
    };
  }
}

export const deterministicEntityExtractor = DeterministicEntityExtractor.getInstance();
