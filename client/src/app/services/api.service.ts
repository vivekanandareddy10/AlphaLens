import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Mock data definitions for MNCs
const MOCK_REPORTS_DATABASE: { [key: string]: any } = {
  'apple': {
    companyName: 'Apple Inc.',
    ticker: 'AAPL',
    profile: {
      industry: 'Consumer Electronics',
      sector: 'Technology',
      ceo: 'Tim Cook',
      headquarters: 'One Apple Park Way, Cupertino, CA',
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. Its key product lines include iPhone, Mac, iPad, and Apple Watch.',
      website: 'https://www.apple.com',
      name: 'Apple Inc.'
    },
    financialData: {
      revenue: '$391.03B',
      revenueGrowth: '8.5%',
      netProfit: '$97.00B',
      profitMargin: '24.81%',
      peRatio: '31.2',
      eps: '6.16',
      dividendYield: '0.45%',
      debt: '$102.5B',
      currentPrice: '$218.50',
      fiftyTwoWeekHigh: '$237.49',
      fiftyTwoWeekLow: '$164.08',
      marketCap: '$3.35T',
      history: [
        { date: 'Jul 1', close: 210 },
        { date: 'Jul 5', close: 215 },
        { date: 'Jul 10', close: 213 },
        { date: 'Jul 15', close: 218 },
        { date: 'Jul 20', close: 222 },
        { date: 'Jul 25', close: 224 },
        { date: 'Aug 1', close: 218 }
      ],
      annualTrends: [
        { year: '2021', revenue: 365817000000, profit: 94680000000 },
        { year: '2022', revenue: 394328000000, profit: 99803000000 },
        { year: '2023', revenue: 383285000000, profit: 96995000000 },
        { year: '2024', revenue: 391035000000, profit: 97003000000 }
      ]
    },
    newsSummary: {
      sentiment: 'Positive/Neutral',
      positive: [
        'Robust demand for iPhone 16 Pro models.',
        'Growing subscription revenues from Apple Services (Apple TV+, iCloud, Apple Music).',
        'Expansion into AI with Apple Intelligence features.'
      ],
      negative: [
        'Regulatory antitrust pressure in the US and Europe.',
        'Slightly slower smartphone sales growth in the Chinese market.'
      ],
      sources: [
        { title: 'Apple Intelligence features rolled out in beta', url: 'https://finance.yahoo.com' },
        { title: 'EU fine against Apple App Store policies', url: 'https://bloomberg.com' }
      ]
    },
    riskAnalysis: {
      financial: 'Low - Exceptionally strong balance sheet with $150B+ in cash reserves.',
      competition: 'Moderate - Competing with Google, Samsung, and Huawei in key device markets.',
      volatility: 'Low - Strong institutional backing stabilizes the stock.',
      regulatory: 'High - Subject to continuous anti-monopoly suits in multiple jurisdictions.',
      challenges: 'Global hardware supply chain complexities.'
    },
    recommendation: {
      action: 'INVEST',
      confidence: 88,
      summary: 'Strong cash positions, a growing high-margin services segment, and Apple Intelligence adoption make Apple a low-risk, high-return leader.',
      pros: [
        'Massive ecosystem lock-in and high brand loyalty.',
        'Extremely strong balance sheet.',
        'High-margin services revenue growth.'
      ],
      cons: [
        'Heavy reliance on iPhone hardware sales.',
        'Active regulatory antitrust scrutiny.'
      ],
      longTermOutlook: 'Bullish. Continued services expansion and AI integration should sustain hardware replacement cycles and maintain long-term ecosystem value.'
    }
  },
  'microsoft': {
    companyName: 'Microsoft Corporation',
    ticker: 'MSFT',
    profile: {
      industry: 'Software - Infrastructure',
      sector: 'Technology',
      ceo: 'Satya Nadella',
      headquarters: 'One Microsoft Way, Redmond, WA',
      description: 'Microsoft Corporation develops and supports software, services, devices, and solutions worldwide. The company operates in Productivity and Business Processes, Intelligent Cloud, and More Personal Computing segments.',
      website: 'https://www.microsoft.com',
      name: 'Microsoft Corporation'
    },
    financialData: {
      revenue: '$245.12B',
      revenueGrowth: '16.0%',
      netProfit: '$88.10B',
      profitMargin: '35.94%',
      peRatio: '35.4',
      eps: '11.80',
      dividendYield: '0.72%',
      debt: '$78.4B',
      currentPrice: '$418.20',
      fiftyTwoWeekHigh: '$468.35',
      fiftyTwoWeekLow: '$380.20',
      marketCap: '$3.11T',
      history: [
        { date: 'Jul 1', close: 405 },
        { date: 'Jul 5', close: 412 },
        { date: 'Jul 10', close: 410 },
        { date: 'Jul 15', close: 415 },
        { date: 'Jul 20', close: 423 },
        { date: 'Jul 25', close: 426 },
        { date: 'Aug 1', close: 418 }
      ],
      annualTrends: [
        { year: '2021', revenue: 168088000000, profit: 61271000000 },
        { year: '2022', revenue: 198270000000, profit: 72738000000 },
        { year: '2023', revenue: 211915000000, profit: 72361000000 },
        { year: '2024', revenue: 245120000000, profit: 88100000000 }
      ]
    },
    newsSummary: {
      sentiment: 'Highly Positive',
      positive: [
        'Unparalleled growth in Azure Cloud services driven by OpenAI integrations.',
        'Rapid enterprise adoption of Microsoft 365 Copilot subscriptions.',
        'Strong synergies and console revenues following Activision Blizzard acquisition.'
      ],
      negative: [
        'Increased capital expenditures for AI data centers affecting short-term operating margins.',
        'Heightened cybersecurity security reviews after cloud breaches.'
      ],
      sources: [
        { title: 'Microsoft Azure posts 33% growth fueled by AI workload demand', url: 'https://reuters.com' },
        { title: 'Securing cloud infrastructure remains Microsoft primary focus', url: 'https://bloomberg.com' }
      ]
    },
    riskAnalysis: {
      financial: 'Low - Very strong balance sheet with robust free cash flows.',
      competition: 'Moderate - Heavy battle with Amazon Web Services and Google Cloud.',
      volatility: 'Low - Highly defensive mega-cap stock with consistent dividend growth.',
      regulatory: 'Moderate - Subject to EU bundling reviews regarding Teams.',
      challenges: 'High energy consumption and chip supply needs for new AI centers.'
    },
    recommendation: {
      action: 'INVEST',
      confidence: 93,
      summary: 'Microsoft leads the global AI enterprise revolution. The compounding revenues from Azure and Copilot create a long-term compound growth machine.',
      pros: [
        'Global enterprise monopoly in OS and office software.',
        'Early and extremely successful commercialization of Generative AI.',
        'World-class cloud infrastructure.'
      ],
      cons: [
        'Extremely high capital expenditure requirements.',
        'Premium valuation limits short-term multiple expansion.'
      ],
      longTermOutlook: 'Highly Bullish. Cloud migration and AI automation software integrations will secure double-digit revenue growth throughout the decade.'
    }
  },
  'google': {
    companyName: 'Alphabet Inc. (Google)',
    ticker: 'GOOGL',
    profile: {
      industry: 'Internet Content & Information',
      sector: 'Communication Services',
      ceo: 'Sundar Pichai',
      headquarters: '1600 Amphitheatre Parkway, Mountain View, CA',
      description: 'Alphabet Inc. offers search, online advertising, maps, cloud computing, hardware, and video streaming via YouTube. The company operates globally and is a pioneer in Artificial Intelligence.',
      website: 'https://abc.xyz',
      name: 'Alphabet Inc. (Google)'
    },
    financialData: {
      revenue: '$307.39B',
      revenueGrowth: '14.2%',
      netProfit: '$73.80B',
      profitMargin: '24.01%',
      peRatio: '24.8',
      eps: '5.80',
      dividendYield: '0.42%',
      debt: '$28.9B',
      currentPrice: '$168.10',
      fiftyTwoWeekHigh: '$191.85',
      fiftyTwoWeekLow: '$129.40',
      marketCap: '$2.09T',
      history: [
        { date: 'Jul 1', close: 158 },
        { date: 'Jul 5', close: 161 },
        { date: 'Jul 10', close: 159 },
        { date: 'Jul 15', close: 165 },
        { date: 'Jul 20', close: 171 },
        { date: 'Jul 25', close: 173 },
        { date: 'Aug 1', close: 168 }
      ],
      annualTrends: [
        { year: '2021', revenue: 257637000000, profit: 76033000000 },
        { year: '2022', revenue: 282836000000, profit: 59972000000 },
        { year: '2023', revenue: 307394000000, profit: 73795000000 }
      ]
    },
    newsSummary: {
      sentiment: 'Positive/Neutral',
      positive: [
        'Double-digit growth in Search and YouTube ad revenues.',
        'Google Cloud profit margins improving and capturing enterprise AI contracts.',
        'Excellent progress with Gemini LLM models integrated directly into Android devices.'
      ],
      negative: [
        'US DOJ antitrust ruling finding Google an illegal monopoly in online search.',
        'Risk of generative search replies decreasing standard search link clicks.'
      ],
      sources: [
        { title: 'Google antitrust ruling: What DOJ remedies mean for shareholders', url: 'https://nytimes.com' },
        { title: 'YouTube Shorts advertising monetization matches expectations', url: 'https://cnbc.com' }
      ]
    },
    riskAnalysis: {
      financial: 'Low - Massive cash reserves and high margins.',
      competition: 'High - Threat from OpenAI Search, Bing, and TikTok (for youth search).',
      volatility: 'Low - Institutional backing remains solid.',
      regulatory: 'Severe - Imminent antitrust breakup risk or advertising restriction policies.',
      challenges: 'Adapting the search monetization model to AI chat layouts.'
    },
    recommendation: {
      action: 'INVEST',
      confidence: 82,
      summary: 'While regulatory pressure is a concern, Alphabet’s valuation remains much more reasonable than peers, and its Android, YouTube, and Search moat remains intact.',
      pros: [
        'Dominant global search engine market share (>90%).',
        'Strong growth in YouTube and YouTube TV.',
        'Reasonable PE multiple compared to other AI giants.'
      ],
      cons: [
        'Very high regulatory search breakup risks.',
        'Increased AI computing cost pressure.'
      ],
      longTermOutlook: 'Positive. Search may evolve, but the global Android/YouTube network and Google Cloud scaling ensure structural profitability.'
    }
  },
  'nvidia': {
    companyName: 'NVIDIA Corporation',
    ticker: 'NVDA',
    profile: {
      industry: 'Semiconductors',
      sector: 'Technology',
      ceo: 'Jensen Huang',
      headquarters: '2788 San Tomas Expressway, Santa Clara, CA',
      description: 'NVIDIA Corporation designs graphics processing units (GPUs) for gaming and professional markets, as well as system on a chip units for mobile computing and automotive markets. It dominates the global AI training hardware market.',
      website: 'https://www.nvidia.com',
      name: 'NVIDIA Corporation'
    },
    financialData: {
      revenue: '$96.31B',
      revenueGrowth: '260%',
      netProfit: '$53.00B',
      profitMargin: '55.03%',
      peRatio: '68.5',
      eps: '2.20',
      dividendYield: '0.03%',
      debt: '$8.5B',
      currentPrice: '$118.90',
      fiftyTwoWeekHigh: '$140.76',
      fiftyTwoWeekLow: '$45.01',
      marketCap: '$2.92T',
      history: [
        { date: 'Jul 1', close: 100 },
        { date: 'Jul 5', close: 108 },
        { date: 'Jul 10', close: 115 },
        { date: 'Jul 15', close: 122 },
        { date: 'Jul 20', close: 130 },
        { date: 'Jul 25', close: 124 },
        { date: 'Aug 1', close: 118 }
      ],
      annualTrends: [
        { year: '2022', revenue: 26974000000, profit: 9752000000 },
        { year: '2023', revenue: 26974000000, profit: 4368000000 },
        { year: '2024', revenue: 60922000000, profit: 29760000000 },
        { year: '2025', revenue: 96310000000, profit: 53000000000 }
      ]
    },
    newsSummary: {
      sentiment: 'Highly Positive',
      positive: [
        'Unprecedented demand for Hopper H100/H200 and upcoming Blackwell B200 AI GPUs.',
        'Extremely high gross margins (>75%) showing pricing power.',
        'Moat secured by CUDA software ecosystem which lock developers into Nvidia hardware.'
      ],
      negative: [
        'Geopolitical US restrictions on export of high-end chips to China.',
        'Potential hyper-cyclical supply gluts if cloud providers reduce chip purchasing.'
      ],
      sources: [
        { title: 'Blackwell chip delays resolved; volume shipments start next quarter', url: 'https://barrons.com' },
        { title: 'Competitors like AMD and custom cloud chips aim at Nvidia CUDA moat', url: 'https://techcrunch.com' }
      ]
    },
    riskAnalysis: {
      financial: 'Low - Massive revenue acceleration and negligible debt.',
      competition: 'High - AMD, Intel, and custom silicon (TPUs/ASICs) by Google/Amazon.',
      volatility: 'Severe - The stock exhibits high beta and rapid price swings.',
      regulatory: 'Moderate - Export bans and antitrust reviews regarding supplier lock-in.',
      challenges: 'TSMC foundry supply bottleneck limits manufacturing capacity.'
    },
    recommendation: {
      action: 'INVEST',
      confidence: 85,
      summary: 'NVIDIA operates as the arms dealer of the AI Gold Rush. Its CUDA software ecosystem makes hardware replacements hard for developers, keeping margins exceptionally high.',
      pros: [
        'Absolute monopoly (>90% share) in AI datacenter hardware.',
        'CUDA software developer lock-in.',
        'Exceptional growth and capital returns.'
      ],
      cons: [
        'High dependency on TSMC in Taiwan.',
        'Very high valuation multiple requires sustained hyper-growth.'
      ],
      longTermOutlook: 'Bullish. Datacenters are transitioning entirely to accelerated computing, which will support GPU demand for years.'
    }
  },
  'tesla': {
    companyName: 'Tesla, Inc.',
    ticker: 'TSLA',
    profile: {
      industry: 'Auto Manufacturers',
      sector: 'Consumer Cyclical',
      ceo: 'Elon Musk',
      headquarters: '1 Tesla Road, Austin, TX',
      description: 'Tesla, Inc. designs, develops, manufactures, sells, and leases fully electric vehicles, energy generation and storage systems, and offers services related to its products. It is leading autonomy, FSD, and humanoid robotics research.',
      website: 'https://www.tesla.com',
      name: 'Tesla, Inc.'
    },
    financialData: {
      revenue: '$96.77B',
      revenueGrowth: '3.5%',
      netProfit: '$15.00B',
      profitMargin: '15.50%',
      peRatio: '85.2',
      eps: '4.30',
      dividendYield: 'N/A',
      debt: '$9.5B',
      currentPrice: '$204.50',
      fiftyTwoWeekHigh: '$271.00',
      fiftyTwoWeekLow: '$138.80',
      marketCap: '$650.00B',
      history: [
        { date: 'Jul 1', close: 185 },
        { date: 'Jul 5', close: 198 },
        { date: 'Jul 10', close: 220 },
        { date: 'Jul 15', close: 235 },
        { date: 'Jul 20', close: 248 },
        { date: 'Jul 25', close: 218 },
        { date: 'Aug 1', close: 204 }
      ],
      annualTrends: [
        { year: '2021', revenue: 53823000000, profit: 5519000000 },
        { year: '2022', revenue: 81462000000, profit: 12587000000 },
        { year: '2023', revenue: 96773000000, profit: 14997000000 }
      ]
    },
    newsSummary: {
      sentiment: 'Mixed',
      positive: [
        'Significant growth in Megapack Energy storage division (utility batteries).',
        'FSD (Full Self-Driving) Version 12 neural-net architecture receiving praise.',
        'Cybertruck production ramp-up.'
      ],
      negative: [
        'Automotive gross margins decreasing due to price cuts and high EV competition in China (BYD).',
        'Slowing global consumer EV demand.'
      ],
      sources: [
        { title: 'Tesla Megapack shipments hit records, offsetting auto slowdown', url: 'https://electrek.co' },
        { title: 'EV price wars squeeze Tesla margin target profiles', url: 'https://wsj.com' }
      ]
    },
    riskAnalysis: {
      financial: 'Low - Zero debt and a large cash reserve.',
      competition: 'Severe - Chinese EV makers (BYD, Xiaomi) and legacy auto transition.',
      volatility: 'Severe - Highly volatile and speculative retail interest.',
      regulatory: 'Moderate - Safety investigations into Autopilot and FSD.',
      challenges: 'Execution risk of Robotaxi deployment and Optimus Humanoid Robot scaling.'
    },
    recommendation: {
      action: 'HOLD',
      confidence: 68,
      summary: 'Tesla is currently in a transition phase. While EV margins are compressed, its battery energy storage business is growing at 100%+ and FSD licensing offers massive options value.',
      pros: [
        'World-class battery technology and charging infrastructure.',
        'High options value on Autonomy, Robotics, and AI.',
        'Strong brand advocacy and zero dealership friction.'
      ],
      cons: [
        'Declining automotive gross margins.',
        'CEO key-man risks and political controversies.'
      ],
      longTermOutlook: 'Highly Speculative/Bullish. If Robotaxis and humanoid robots succeed, Tesla is worth trillions. If it remains an auto company, it is overvalued.'
    }
  }
};

// Generic fallback report function
function generateGenericReport(companyName: string) {
  const ticker = companyName.slice(0, 4).toUpperCase().replace(/\s+/g, '');
  return {
    companyName: companyName,
    ticker: ticker,
    profile: {
      industry: 'Global Multi-Industry',
      sector: 'Diversified Conglomerate',
      ceo: 'Corporate Administration',
      headquarters: 'New York City, NY',
      description: `${companyName} is a leading global multi-industry leader operating across key international markets, driving innovations in client solutions, digital transformation, and infrastructure services.`,
      website: `https://www.google.com/search?q=${encodeURIComponent(companyName)}`,
      name: companyName
    },
    financialData: {
      revenue: '$45.50B',
      revenueGrowth: '6.2%',
      netProfit: '$4.20B',
      profitMargin: '9.23%',
      peRatio: '18.4',
      eps: '3.40',
      dividendYield: '1.25%',
      debt: '$12.5B',
      currentPrice: '$120.40',
      fiftyTwoWeekHigh: '$135.00',
      fiftyTwoWeekLow: '$98.50',
      marketCap: '$85.00B',
      history: [
        { date: 'Jul 1', close: 105 },
        { date: 'Jul 5', close: 108 },
        { date: 'Jul 10', close: 110 },
        { date: 'Jul 15', close: 114 },
        { date: 'Jul 20', close: 122 },
        { date: 'Jul 25', close: 119 },
        { date: 'Aug 1', close: 120 }
      ],
      annualTrends: [
        { year: '2022', revenue: 38200000000, profit: 3100000000 },
        { year: '2023', revenue: 42300000000, profit: 3800000000 },
        { year: '2024', revenue: 45500000000, profit: 4200000000 }
      ]
    },
    newsSummary: {
      sentiment: 'Positive',
      positive: [
        `Strong client engagement and revenue growth across ${companyName}'s divisions.`,
        'Successful integration of automated systems reducing operational overhead.',
        'Expansion into new growing geographical markets.'
      ],
      negative: [
        'Macro headwinds and global supply constraints.',
        'Slightly higher interest expenses on debt servicing.'
      ],
      sources: [
        { title: `${companyName} announces strategic restructuring plan`, url: '#' },
        { title: `Market analysts update targets for ${companyName}`, url: '#' }
      ]
    },
    riskAnalysis: {
      financial: 'Moderate - Managed debt structure with steady earnings cover.',
      competition: 'Moderate - Standard market share dynamics within the peer group.',
      volatility: 'Low - Low-beta asset showing stable dividend preservation.',
      regulatory: 'Low - Operating fully within compliant global legal standards.',
      challenges: 'Aligning workforce productivity with digital automation technologies.'
    },
    recommendation: {
      action: 'INVEST',
      confidence: 76,
      summary: `${companyName} offers stable earnings growth, strong corporate leadership, and a resilient business model that is defensive against market corrections.`,
      pros: [
        'Steady, reliable cash flow streams.',
        'Strong product differentiation in core markets.',
        'Competent management execution.'
      ],
      cons: [
        'Moderate growth speed compared to technology peers.',
        'Exposure to global shipping and logistics cost fluctuations.'
      ],
      longTermOutlook: 'Stable. Positive long-term compound gains driven by market expansion and product line extensions.'
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private localReportsKey = 'alphalens_saved_reports';
  private localHistoryKey = 'alphalens_search_history';

  constructor() {
    this.initializeLocalStorage();
  }

  private initializeLocalStorage() {
    if (!localStorage.getItem(this.localReportsKey)) {
      // Pre-populate with Apple report as the default saved report
      const appleReport = {
        _id: 'report_apple_123',
        createdAt: new Date().toISOString(),
        ...MOCK_REPORTS_DATABASE['apple']
      };
      localStorage.setItem(this.localReportsKey, JSON.stringify([appleReport]));
    }
    if (!localStorage.getItem(this.localHistoryKey)) {
      const defaultHistory = [
        { companyName: 'Apple Inc.', searchedAt: new Date().toISOString() },
        { companyName: 'Microsoft Corporation', searchedAt: new Date().toISOString() },
        { companyName: 'Google', searchedAt: new Date().toISOString() },
        { companyName: 'Nvidia', searchedAt: new Date().toISOString() },
        { companyName: 'Tesla', searchedAt: new Date().toISOString() }
      ];
      localStorage.setItem(this.localHistoryKey, JSON.stringify(defaultHistory));
    }
  }

  private getLocalReports(): any[] {
    const data = localStorage.getItem(this.localReportsKey);
    return data ? JSON.parse(data) : [];
  }

  private setLocalReports(reports: any[]) {
    localStorage.setItem(this.localReportsKey, JSON.stringify(reports));
  }

  private getLocalHistory(): any[] {
    const data = localStorage.getItem(this.localHistoryKey);
    return data ? JSON.parse(data) : [];
  }

  private setLocalHistory(history: any[]) {
    localStorage.setItem(this.localHistoryKey, JSON.stringify(history));
  }

  // Frontend Offline Mock API implementation
  research(companyName: string): Observable<any> {
    console.log(`[Offline Mock API] Researching: "${companyName}"`);
    
    // Normalize name to look up in mock database
    const queryLower = companyName.toLowerCase();
    let reportData = null;

    if (queryLower.includes('apple')) {
      reportData = { ...MOCK_REPORTS_DATABASE['apple'] };
    } else if (queryLower.includes('microsoft')) {
      reportData = { ...MOCK_REPORTS_DATABASE['microsoft'] };
    } else if (queryLower.includes('google') || queryLower.includes('alphabet')) {
      reportData = { ...MOCK_REPORTS_DATABASE['google'] };
    } else if (queryLower.includes('nvidia') || queryLower.includes('nvda')) {
      reportData = { ...MOCK_REPORTS_DATABASE['nvidia'] };
    } else if (queryLower.includes('tesla') || queryLower.includes('tsla')) {
      reportData = { ...MOCK_REPORTS_DATABASE['tesla'] };
    } else {
      reportData = generateGenericReport(companyName);
    }

    const newReport = {
      _id: `report_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...reportData
    };

    // Save search history
    const history = this.getLocalHistory();
    history.unshift({ companyName: newReport.companyName, searchedAt: new Date().toISOString() });
    // Limit history to top 10
    this.setLocalHistory(history.slice(0, 10));

    // Save report to local reports database automatically
    const reports = this.getLocalReports();
    reports.unshift(newReport);
    this.setLocalReports(reports);

    // Return with a 1.8 second delay to allow progress animations to display beautifully
    return of(newReport).pipe(delay(1800));
  }

  getReports(): Observable<any[]> {
    return of(this.getLocalReports()).pipe(delay(200));
  }

  getReport(id: string): Observable<any> {
    const reports = this.getLocalReports();
    const report = reports.find(r => r._id === id);
    return of(report || null).pipe(delay(200));
  }

  deleteReport(id: string): Observable<any> {
    let reports = this.getLocalReports();
    reports = reports.filter(r => r._id !== id);
    this.setLocalReports(reports);
    return of({ success: true }).pipe(delay(100));
  }

  getHistory(): Observable<any[]> {
    return of(this.getLocalHistory()).pipe(delay(200));
  }

  askChatFollowUp(id: string, message: string, chatHistory: any[]): Observable<any> {
    console.log(`[Offline Mock Chat] Message: "${message}"`);
    
    // Simple mock responses based on terms
    const msgLower = message.toLowerCase();
    let reply = `Based on the financial report, the company demonstrates stable performance indicators. If you look at the peRatio and profitMargin, it is clear that they maintain strong sector positions compared to peers. Let me know if you would like me to detail their pros or risk evaluation challenges!`;

    if (msgLower.includes('buy') || msgLower.includes('sell') || msgLower.includes('recommendation') || msgLower.includes('invest')) {
      reply = `Our multi-agent system recommendation is to **INVEST** with a high confidence factor. This is driven by their robust technological moat, exceptionally healthy cash flow statement reserves, and strong CEO execution performance. Cons to watch include international antitrust suits and valuation multiple limits.`;
    } else if (msgLower.includes('risk') || msgLower.includes('threat') || msgLower.includes('regulation') || msgLower.includes('challenges')) {
      reply = `The primary risks identified by our Risk Agent include **regulatory anti-monopoly scrutiny** (high severity), followed by hardware supply chain constraints and semiconductor chip bottlenecks. Geopolitical trade limitations also pose short-term challenges.`;
    } else if (msgLower.includes('revenue') || msgLower.includes('finance') || msgLower.includes('profit') || msgLower.includes('growth')) {
      reply = `Looking at the financials: The netProfit margins exceed 20%, showing incredibly high profitability. Revenue growth has remained double-digit, backed by enterprise cloud and subscription services. The balance sheet shows negligible debt with huge cash reserves.`;
    }

    return of({ reply }).pipe(delay(1000));
  }
}
