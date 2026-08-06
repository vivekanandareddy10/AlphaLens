import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  ticker: {
    type: String,
    trim: true,
  },
  profile: {
    industry: String,
    sector: String,
    ceo: String,
    headquarters: String,
    description: String,
    website: String,
  },
  financialData: {
    revenue: String,
    revenueGrowth: String,
    netProfit: String,
    profitMargin: String,
    peRatio: String,
    eps: String,
    dividendYield: String,
    debt: String,
    currentPrice: String,
    fiftyTwoWeekHigh: String,
    fiftyTwoWeekLow: String,
    marketCap: String,
    history: Array, // 30-day closing prices
    annualTrends: Array, // annual revenue/profit trends
  },
  newsSummary: {
    positive: [String],
    negative: [String],
    sentiment: String,
    sources: [
      {
        title: String,
        url: String,
      }
    ]
  },
  riskAnalysis: {
    financial: String,
    competition: String,
    volatility: String,
    regulatory: String,
    challenges: String,
  },
  recommendation: {
    action: {
      type: String,
      enum: ['INVEST', 'PASS'],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    summary: String,
    pros: [String],
    cons: [String],
    longTermOutlook: String,
  },
  failedNodes: {
    type: Map,
    of: String,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export const Report = mongoose.model('Report', reportSchema);
