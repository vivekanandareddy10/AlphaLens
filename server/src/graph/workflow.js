import { StateGraph, START, END } from '@langchain/langgraph';
import { ResearchState } from './state.js';
import { getTicker, getCompanyProfile, getFinancialData } from '../services/yahooFinance.js';
import { searchCompanyNews } from '../services/tavily.js';
import { getGroqModel } from "../services/groq.js";

// Helper to extract JSON from LLM response safely
function cleanAndParseJSON(text) {
  try {
    if (typeof text === 'object') return text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const cleanText = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Failed to parse JSON from LLM output:', text);
    throw error;
  }
}


// 1. Research Agent
async function researchNode(state) {
  console.log(`[Research Agent] Started research on: ${state.companyName}`);
  try {
    const { ticker, name } = await getTicker(state.companyName);
    const profile = await getCompanyProfile(ticker);
    return {
      ticker,
      companyName: name,
      profile,
    };
  } catch (error) {
    console.error('[Research Agent] Error:', error);
    return {
      ticker: state.companyName.toUpperCase().replace(/\s+/g, ''),
      profile: {
        industry: 'N/A',
        sector: 'N/A',
        ceo: 'N/A',
        headquarters: 'N/A',
        description: 'Failed to retrieve profile description due to an error.',
      },
      failedNodes: { node: 'Research Agent', error: error.message }
    };
  }
}

// 2. Finance Agent
async function financeNode(state) {
  console.log(`[Finance Agent] Fetching financial data for: ${state.ticker}`);
  try {
    const financialData = await getFinancialData(state.ticker);
    return { financialData };
  } catch (error) {
    console.error('[Finance Agent] Error:', error);
    return {
      financialData: {
        revenue: 'N/A',
        revenueGrowth: 'N/A',
        netProfit: 'N/A',
        profitMargin: 'N/A',
        peRatio: 'N/A',
        eps: 'N/A',
        dividendYield: 'N/A',
        debt: 'N/A',
        currentPrice: 'N/A',
        fiftyTwoWeekHigh: 'N/A',
        fiftyTwoWeekLow: 'N/A',
        marketCap: 'N/A',
        history: [],
        annualTrends: [],
      },
      failedNodes: { node: 'Financial Data Agent', error: error.message }
    };
  }
}

// 3. News Agent
async function newsNode(state) {
  console.log(`[News Agent] Retrieval & Summary for: ${state.companyName}`);
  try {
    const newsArticles = await searchCompanyNews(state.companyName);
    
    const articlesContext = newsArticles.map((art, idx) => 
      `[Article ${idx + 1}] Title: ${art.title}\nContent Snippet: ${art.content}\n`
    ).join('\n');

    const prompt = `You are a financial news analysis AI agent. Analyze the following news articles about ${state.companyName} and generate a structured summary.
You must return your output ONLY as a JSON code block. Do not include any explanation outside the JSON.

Articles:
${articlesContext}

Required JSON Format:
\`\`\`json
{
  "positive": [
    "Brief point 1 of positive news/developments",
    "Brief point 2..."
  ],
  "negative": [
    "Brief point 1 of negative news/developments/concerns",
    "Brief point 2..."
  ],
  "sentiment": "Positive / Negative / Neutral - overall summary of market sentiment"
}
\`\`\``;

    let newsSummary = { positive: [], negative: [], sentiment: 'Neutral' };
    
    if (process.env.GROQ_API_KEY) {
      const model = getGroqModel();
      const response = await model.invoke(prompt);
      newsSummary = cleanAndParseJSON(response.content);
    } else {
      newsSummary = {
        positive: [`Strong interest in ${state.companyName}'s product development.`],
        negative: ['Industry challenges and macro headwinds.'],
        sentiment: 'Positive/Neutral'
      };
    }

    newsSummary.sources = newsArticles.map(art => ({
      title: art.title,
      url: art.url || '#'
    }));

    return { newsSummary };
  } catch (error) {
    console.error('[News Agent] Error:', error);
    return {
      newsSummary: {
        positive: ['Could not fetch positive news headlines.'],
        negative: ['Could not fetch negative news headlines.'],
        sentiment: 'Unknown',
        sources: []
      },
      failedNodes: { node: 'News Analysis Agent', error: error.message }
    };
  }
}

// 4. Risk Agent
async function riskNode(state) {
  console.log(`[Risk Agent] Evaluating business risks for: ${state.companyName}`);
  try {
    const prompt = `You are a senior investment risk analyst. Evaluate the risks for ${state.companyName} (${state.ticker}) based on the following profile and financial details:

Profile:
Industry: ${state.profile.industry}
Sector: ${state.profile.sector}
Description: ${state.profile.description}

Financials:
Market Cap: ${state.financialData.marketCap}
Revenue: ${state.financialData.revenue}
Profit Margin: ${state.financialData.profitMargin}
PE Ratio: ${state.financialData.peRatio}
EPS: ${state.financialData.eps}
Debt: ${state.financialData.debt}

Analyze the business across 5 key dimensions.
You must return your output ONLY as a JSON code block. Do not include any explanation outside the JSON.

Required JSON Format:
\`\`\`json
{
  "financial": "Analysis of balance sheet, debt levels, profitability margins",
  "competition": "Competitor landscape and threat of substitutes/new entrants",
  "volatility": "Market pricing, share price fluctuations, Beta analysis",
  "regulatory": "Pending laws, compliance burdens, government interventions",
  "challenges": "General industry bottlenecks, supply chain issues, etc."
}
\`\`\``;

    let riskAnalysis = {};

    if (process.env.GROQ_API_KEY) {
      const model = getGroqModel();
      const response = await model.invoke(prompt);
      riskAnalysis = cleanAndParseJSON(response.content);
    } else {
      riskAnalysis = {
        financial: 'Standard capital requirements are met.',
        competition: 'Intense competition in tech and global markets.',
        volatility: 'Broad market moves are the primary driver of volatility.',
        regulatory: 'Regular anti-trust watch.',
        challenges: 'Global trade fluctuations affect components.'
      };
    }

    return { riskAnalysis };
  } catch (error) {
    console.error('[Risk Agent] Error:', error);
    return {
      riskAnalysis: {
        financial: 'Failed to run financial risk assessment.',
        competition: 'Failed to run competitive risk assessment.',
        volatility: 'Failed to run volatility risk assessment.',
        regulatory: 'Failed to run regulatory risk assessment.',
        challenges: 'Failed to run general risk challenges assessment.'
      },
      failedNodes: { node: 'Risk Analysis Agent', error: error.message }
    };
  }
}

// 5. Decision Agent
async function decisionNode(state) {
  console.log(`[Decision Agent] Formatting recommendation for: ${state.companyName}`);
  try {
    const prompt = `You are the lead Investment Committee Director. Based on all the research collected on ${state.companyName} (${state.ticker}), provide a final recommendation: INVEST or PASS.

Input Data:
Profile:
Industry: ${state.profile.industry} | Sector: ${state.profile.sector}
Description: ${state.profile.description?.slice(0, 500)}...

Financials:
Revenue: ${state.financialData.revenue} | PE: ${state.financialData.peRatio} | EPS: ${state.financialData.eps}
Debt: ${state.financialData.debt} | Margin: ${state.financialData.profitMargin} | Cap: ${state.financialData.marketCap}

News Summary:
Sentiment: ${state.newsSummary.sentiment}
Positive: ${state.newsSummary.positive?.join('; ')}
Negative: ${state.newsSummary.negative?.join('; ')}

Risk Analysis:
Financial: ${state.riskAnalysis.financial}
Competitive: ${state.riskAnalysis.competition}
Regulatory: ${state.riskAnalysis.regulatory}

Please formulate a definitive INVEST or PASS recommendation.
Provide a confidence score from 0 to 100 based on the strength of financials, market dynamics, news, and risk profiles.
You must return your output ONLY as a JSON code block. Do not include any explanation outside the JSON.

Required JSON Format:
\`\`\`json
{
  "action": "INVEST" or "PASS",
  "confidence": 85, (a number between 0 and 100)
  "summary": "Clear, direct logic summarizing the main rationale for this decision",
  "pros": [
    "Key investment reason 1",
    "Key investment reason 2",
    "Key investment reason 3"
  ],
  "cons": [
    "Key risk/concern 1",
    "Key risk/concern 2"
  ],
  "longTermOutlook": "Detailed perspective of the company's prospects over the next 5-10 years"
}
\`\`\``;

    let recommendation = {};

    if (process.env.GROQ_API_KEY) {
      const model = getGroqModel();
      const response = await model.invoke(prompt);
      recommendation = cleanAndParseJSON(response.content);
    } else {
      recommendation = {
        action: 'INVEST',
        confidence: 75,
        summary: `Strong cash positions and clear sector leadership makes ${state.companyName} a compelling choice.`,
        pros: ['Strong revenue growth', 'Generous capital margins', 'Technological moat'],
        cons: ['High market valuation', 'Regulatory investigations'],
        longTermOutlook: 'Positive, with potential to command high market shares over the next decade.'
      };
    }

    return { recommendation };
  } catch (error) {
    console.error('[Decision Agent] Error:', error);
    return {
      recommendation: {
        action: 'PASS',
        confidence: 0,
        summary: 'Decision node failed due to execution error. Rating set to PASS automatically.',
        pros: ['N/A'],
        cons: ['System decision failure'],
        longTermOutlook: 'Execution error occurred during synthesis.'
      },
      failedNodes: { node: 'Decision Agent', error: error.message }
    };
  }
}

// Build LangGraph StateGraph
const workflow = new StateGraph(ResearchState)
  .addNode('research', researchNode)
  .addNode('finance', financeNode)
  .addNode('news', newsNode)
  .addNode('risk', riskNode)
  .addNode('decision', decisionNode)
  .addEdge(START, 'research')
  .addEdge('research', 'finance')
  .addEdge('finance', 'news')
  .addEdge('news', 'risk')
  .addEdge('risk', 'decision')
  .addEdge('decision', END);

export const investmentGraph = workflow.compile();
