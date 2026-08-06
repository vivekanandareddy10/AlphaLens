process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isMocked } from './config/db.js';
import { History } from './models/History.js';
import { Report } from './models/Report.js';
import { investmentGraph } from './graph/workflow.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

// In-Memory Database Fallbacks
let memoryReports = [];
let memoryHistory = [];

// API Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: isMocked ? 'in-memory-fallback' : 'mongodb', time: new Date() });
});

// POST /api/research - Start LangGraph execution
app.post('/api/research', async (req, res) => {
  const { companyName } = req.body;

  if (!companyName || typeof companyName !== 'string') {
    return res.status(400).json({ error: 'Company name is required and must be a string' });
  }

  try {
    console.log(`[Server] Research requested for: "${companyName}"`);

    // 1. Add to search history
    if (isMocked) {
      memoryHistory.unshift({ companyName, searchedAt: new Date() });
    } else {
      await History.create({ companyName });
    }

    // 2. Trigger LangGraph Workflow
    const resultState = await investmentGraph.invoke({
      companyName: companyName,
    });

    if (resultState.error) {
      console.error(`[Server] Graph error: ${resultState.error}`);
      return res.status(500).json({ error: resultState.error });
    }

    // 3. Prepare report structure
    const reportData = {
      companyName: resultState.companyName,
      ticker: resultState.ticker,
      profile: resultState.profile,
      financialData: resultState.financialData,
      newsSummary: resultState.newsSummary,
      riskAnalysis: resultState.riskAnalysis,
      recommendation: resultState.recommendation,
      failedNodes: resultState.failedNodes,
    };

    let savedReport;
    if (isMocked) {
      // Mock mongoose saved structure
      savedReport = {
        ...reportData,
        _id: `mem_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };
      memoryReports.unshift(savedReport);
    } else {
      savedReport = await Report.create(reportData);
    }
    
    console.log(`[Server] Saved report with ID: ${savedReport._id}`);
    res.status(201).json(savedReport);
  } catch (error) {
    console.error(`[Server] Research failed:`, error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
});

// GET /api/reports - Get all saved reports
app.get('/api/reports', async (req, res) => {
  try {
    if (isMocked) {
      return res.json(memoryReports);
    }
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/:id - Get detailed report
app.get('/api/reports/:id', async (req, res) => {
  try {
    if (isMocked) {
      const report = memoryReports.find(r => r._id === req.params.id);
      if (!report) {
        return res.status(404).json({ error: 'Report not found in memory' });
      }
      return res.json(report);
    }
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reports/:id - Delete a report
app.delete('/api/reports/:id', async (req, res) => {
  try {
    if (isMocked) {
      const initialLength = memoryReports.length;
      memoryReports = memoryReports.filter(r => r._id !== req.params.id);
      if (memoryReports.length === initialLength) {
        return res.status(404).json({ error: 'Report not found in memory' });
      }
      return res.json({ message: 'Report deleted from memory' });
    }
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/history - Get search history
app.get('/api/history', async (req, res) => {
  try {
    if (isMocked) {
      return res.json(memoryHistory.slice(0, 10));
    }
    const history = await History.find()
      .sort({ searchedAt: -1 })
      .limit(10);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reports/:id/chat - Follow-up chat based on report context
app.post('/api/reports/:id/chat', async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let report;
    if (isMocked) {
      report = memoryReports.find(r => r._id === req.params.id);
    } else {
      report = await Report.findById(req.params.id);
    }

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const chatContext = `
You are a helpful investment research analyst. You are discussing the investment report generated for ${report.companyName} (${report.ticker}).
Use the following report information to answer the user's questions:

Report Details:
Recommendation: ${report.recommendation.action}
Confidence Score: ${report.recommendation.confidence}%
Summary Thesis: ${report.recommendation.summary}
Pros: ${report.recommendation.pros.join(', ')}
Cons: ${report.recommendation.cons.join(', ')}
Long-term Outlook: ${report.recommendation.longTermOutlook}

Profile:
Industry: ${report.profile.industry}
Sector: ${report.profile.sector}
Description: ${report.profile.description}

Financial Metrics:
Revenue: ${report.financialData.revenue}
Profit Margin: ${report.financialData.profitMargin}
PE Ratio: ${report.financialData.peRatio}
EPS: ${report.financialData.eps}
Debt: ${report.financialData.debt}
Current Price: ${report.financialData.currentPrice}

News Sentiment: ${report.newsSummary.sentiment}
Positive Developments: ${report.newsSummary.positive.join('; ')}
Negative Developments: ${report.newsSummary.negative.join('; ')}

Risk Evaluation:
Financial: ${report.riskAnalysis.financial}
Competitive: ${report.riskAnalysis.competition}
Volatility: ${report.riskAnalysis.volatility}
Regulatory: ${report.riskAnalysis.regulatory}
Challenges: ${report.riskAnalysis.challenges}

Provide a direct, concise, and professional response to the user's query.
`;

    if (process.env.GROQ_API_KEY) {
      // Initialize Groq Chat Model
      const { getGroqModel } = await import('./services/groq.js');
      const model = getGroqModel();

      const formattedHistory = chatHistory
        ? chatHistory.map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')
        : '';
      const prompt = `${chatContext}\n\nChat History:\n${formattedHistory}\n\nUser: ${message}\nAssistant:`;

      const response = await model.invoke(prompt);
      res.json({ reply: response.content });
    } else {
      res.json({
        reply: `[Fallback Chat Mode] You asked: "${message}". Recommendation for ${report.companyName} is ${report.recommendation.action} with ${report.recommendation.confidence}% confidence, owing to: ${report.recommendation.summary}`
      });
    }
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
