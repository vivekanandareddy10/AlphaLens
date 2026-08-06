import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const FMP_BASE_URL = 'https://financialmodelingprep.com';
function normalizeSymbol(value) {
  return String(value || '').trim().toUpperCase();
}

function buildUrl(path) {
  const apiKey = process.env.FMP_API_KEY;
  return `${FMP_BASE_URL}${path}${path.includes('?') ? '&' : '?'}apikey=${apiKey}`;
}

function formatCurrency(value) {
  if (value === undefined || value === null || value === '') return 'N/A';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(value) {
  if (value === undefined || value === null || value === '') return 'N/A';
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPercent(value) {
  if (value === undefined || value === null || value === '') return 'N/A';
  return `${Number(value).toFixed(2)}%`;
}

async function fetchFmp(path) {
  try {
    const response = await axios.get(buildUrl(path), { timeout: 15000 });
    return response.data;
  }
  catch (error) {
    console.error(
        "FMP Error:",
        error.response?.status,
        error.response?.data || error.message
    );
    return null;
}
}

// Searches for a ticker symbol using the company name.
export async function getTicker(companyName) {
  const normalizedName = String(companyName || '').trim();
  if (!normalizedName) {
    return { ticker: '', name: '' };
  }

  try {
    const data = await fetchFmp(`/stable/search-name?query=${encodeURIComponent(normalizedName)}`);
    const results = Array.isArray(data) ? data : [];
    const stock = results.find((item) => item?.exchangeShortName && item?.symbol);

    if (stock) {
      return {
        ticker: stock.symbol,
        name: stock.name || normalizedName,
      };
    }
  } catch (error) {
    // Ignore and fall back below.
  }

  return {
    ticker: normalizedName.toUpperCase(),
    name: normalizedName,
  };
}

// Fetches company profile information from FMP.
export async function getCompanyProfile(ticker) {
  const symbol = normalizeSymbol(ticker);
  try {
    const data = await fetchFmp(`/stable/profile?symbol=${encodeURIComponent(symbol)}`);
    const profile = Array.isArray(data) ? data[0] : data;

    return {
      industry: profile?.industry || 'N/A',
      sector: profile?.sector || 'N/A',
      ceo: profile?.ceo || 'N/A',
      headquarters: profile?.address || 'N/A',
      description: profile?.description || 'N/A',
      website: profile?.website || 'N/A',
      name: profile?.companyName || symbol,
    };
  } catch (error) {
    return {
      industry: 'N/A',
      sector: 'N/A',
      ceo: 'N/A',
      headquarters: 'N/A',
      description: 'N/A',
      website: 'N/A',
      name: symbol,
    };
  }
}

// Fetches financial data, historical prices, and annual trends from FMP.
export async function getFinancialData(ticker) {
  const symbol = normalizeSymbol(ticker);

  try {
    const [quoteData, incomeData, historyData] = await Promise.all([
      fetchFmp(`/stable/quote?symbol=${encodeURIComponent(symbol)}`),
      fetchFmp(`/stable/income-statement?symbol=${encodeURIComponent(symbol)}`),
      fetchFmp(`/stable/historical-price-eod/full?symbol=${encodeURIComponent(symbol)}`),
    ]);

    const quote = Array.isArray(quoteData) ? quoteData[0] : quoteData;
    const incomeStatements = Array.isArray(incomeData) ? incomeData : [];
    const history = Array.isArray(historyData) ? historyData : [];

    const latestIncome = incomeStatements[0] || {};
    const latestHistory = history.slice(0, 30).reverse();

    const annualTrends = incomeStatements
      .slice(0, 5)
      .map((item) => ({
        year: item?.calendarYear ? String(item.calendarYear) : 'N/A',
        revenue: Number(item?.revenue) || 0,
        profit: Number(item?.netIncome) || 0,
      }))
      .filter((item) => item.year !== 'N/A');

    return {
      revenue: formatCurrency(latestIncome?.revenue),
      revenueGrowth: 'N/A',
      netProfit: formatCurrency(latestIncome?.netIncome),
      profitMargin: formatPercent(latestIncome?.netIncomeRatio),
      peRatio: formatNumber(quote?.pe),
      eps: formatNumber(quote?.eps),
      dividendYield: formatPercent(quote?.dividendYield),
      debt: 'N/A',
      currentPrice: formatCurrency(quote?.price),
      fiftyTwoWeekHigh: formatCurrency(quote?.yearHigh),
      fiftyTwoWeekLow: formatCurrency(quote?.yearLow),
      marketCap: formatCurrency(quote?.marketCap),
      history: latestHistory.map((item) => ({
        date: item?.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
        close: Number(item?.close) || 0,
      })),
      annualTrends,
    };
  } catch (error) {
    return {
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
    };
  }
}
