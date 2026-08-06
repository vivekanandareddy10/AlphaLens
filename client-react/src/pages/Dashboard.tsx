import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 ArrowLeft, Copy, Check, Printer, Share2, AlertTriangle, 
  TrendingUp, TrendingDown, RefreshCw, BarChart2, MessageCircle, 
  Send, Database, FileText, Search, Plus, Trash2,
  AlertOctagon, Building, ShieldAlert, User, MapPin, Download
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, CartesianGrid, Legend 
} from 'recharts';
import { api } from '../services/api';
import { AgentProgress } from '../components/AgentProgress';
import axios from 'axios';

type TabType = 'report' | 'compare' | 'saved';

export const Dashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const searchName = searchParams.get('search');
  const reportId = searchParams.get('reportId');

  // App States
  const [activeTab, setActiveTab] = useState<TabType>('report');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ agent: string; reason: string } | null>(null);
  const [report, setReport] = useState<any>(null);
  
  // Clipboard/Share action states
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);

  // Saved Reports & History state (for Saved tab)
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  // Company Comparison State
  const [compareCompanyQuery, setCompareCompanyQuery] = useState('');
  const [compareReport, setCompareReport] = useState<any>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Chat follow-up state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSavedAndHistory();
    if (searchName) {
      triggerResearch(searchName);
    } else if (reportId) {
      loadReport(reportId);
    } else {
      setLoading(false);
    }
  }, [searchName, reportId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchSavedAndHistory = async () => {
    try {
      const reports = await api.getReports();
      setSavedReports(reports);
      const history = await api.getHistory();
      setSearchHistory(history);
    } catch (err) {
      console.error('Failed to load history or saved reports:', err);
    }
  };

  const triggerResearch = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.research(name);
      
      // Check if the entire workflow failed (Decision Agent failed to yield output)
      if (data.failedNodes && data.failedNodes['Decision Agent']) {
        setError({
          agent: 'Decision Agent',
          reason: data.failedNodes['Decision Agent'] || 'Critical pipeline execution error.'
        });
        return;
      }
      
      setReport(data);
      setChatMessages([
        { 
          role: 'assistant', 
          content: `Hello! I have generated the investment report for **${data.companyName}**. Ask me follow-up questions about its financial metrics, news sentiment, risk factors, or long-term outlook.` 
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setError({
        agent: 'LangGraph Orchestrator',
        reason: err.response?.data?.error || err.message || 'Workflow crashed during execution.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReport(id);
      setReport(data);
      setChatMessages([
        { 
          role: 'assistant', 
          content: `Loaded report for **${data.companyName}**. Ask me follow-up questions based on this historical analysis.` 
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setError({
        agent: 'Database Connector',
        reason: err.response?.data?.error || 'Failed to retrieve saved report.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await api.deleteReport(id);
      setSavedReports(prev => prev.filter(r => r._id !== id));
      if (report && report._id === id) {
        setReport(null);
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  // Compare a second company
  const handleCompareSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareCompanyQuery.trim()) return;
    
    setCompareLoading(true);
    setCompareError(null);
    try {
      const data = await api.research(compareCompanyQuery);
      setCompareReport(data);
    } catch (err: any) {
      setCompareError(err.response?.data?.error || 'Could not fetch data for the comparison company.');
    } finally {
      setCompareLoading(false);
    }
  };

  // Chat request
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !report) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await axios.post(`http://localhost:5000/api/reports/${report._id}/chat`, {
        message: userMessage,
        chatHistory: chatMessages.slice(1)
      });
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I couldn't reach the AI model. Please verify your server is running with GROQ_API_KEY." 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Copying Summary Markdown
  const handleCopy = () => {
    if (!report) return;
    const textToCopy = `
INVESTMENT REPORT: ${report.companyName} (${report.ticker || 'N/A'})
Recommendation: ${report.recommendation?.action} (Confidence: ${report.recommendation?.confidence}%)
Summary: ${report.recommendation?.summary}
Long-Term Outlook: ${report.recommendation?.longTermOutlook}
    `;
    navigator.clipboard.writeText(textToCopy.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share report mock link
  const handleShare = () => {
    if (!report) return;
    const shareUrl = `${window.location.origin}/dashboard?reportId=${report._id}`;
    navigator.clipboard.writeText(shareUrl);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };
  // Downloads the full report as a text file
  const handleDownload = () => {
    if (!report) return;

    const lines = [
      `INVESTMENT REPORT: ${report.companyName} (${report.ticker || 'N/A'})`,
      `Generated: ${new Date().toLocaleString()}`,
      '='.repeat(60),
      '',
      `RECOMMENDATION: ${report.recommendation?.action} (Confidence: ${report.recommendation?.confidence}%)`,
      '',
      'SUMMARY',
      report.recommendation?.summary || 'N/A',
      '',
      'LONG-TERM OUTLOOK',
      report.recommendation?.longTermOutlook || 'N/A',
      '',
      'COMPANY PROFILE',
      report.profile?.description || 'N/A',
      '',
      'NEWS SENTIMENT SUMMARY',
      report.newsSummary?.summary || 'N/A',
      '',
      '='.repeat(60),
      'Generated by AlphaLens — LangGraph.js + Groq multi-agent research pipeline',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(report.companyName || 'report').replace(/\s+/g, '_')}_AlphaLens_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveReport = async () => {
    if (!report) return;
    try {
      const response = await api.research(report.companyName);
      setReport(response);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await fetchSavedAndHistory();
    } catch (err) {
      console.error('Failed to save report:', err);
    }
  };

  const handleCompareCompany = () => {
    setActiveTab('compare');
  };

  const handleOpenSavedReports = () => {
    navigate('/saved-reports');
  };

  // Helper: map severity of risk details
  const getRiskSeverity = (title: string, text: string) => {
    const combinedText = (title + ' ' + text).toLowerCase();
    if (combinedText.includes('high') || combinedText.includes('critical') || combinedText.includes('severe') || combinedText.includes('threat')) {
      return { label: 'High', style: 'border-l-rose-500 text-rose-400 bg-rose-500/5', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/25' };
    }
    if (combinedText.includes('moderate') || combinedText.includes('medium') || combinedText.includes('volatile') || combinedText.includes('regulatory')) {
      return { label: 'Moderate', style: 'border-l-amber-500 text-amber-400 bg-amber-500/5', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25' };
    }
    return { label: 'Low', style: 'border-l-emerald-500 text-emerald-400 bg-emerald-500/5', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6">
        <AgentProgress companyName={searchName || 'selected target'} />
      </div>
    );
  }

  // Detailed Error Page
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-full mb-6">
          <AlertOctagon className="w-16 h-16 text-rose-500 animate-pulse" />
        </div>
        <h2 className="text-3xl font-extrabold mb-2 tracking-tight text-white">Analysis Interrupted</h2>
        <p className="text-sm text-neutral-400 max-w-md mb-6">
          The <span className="text-rose-400 font-mono font-bold">{error.agent}</span> encountered a critical issue.
        </p>

        {/* Failure Details */}
        <div className="glass max-w-lg p-5 rounded-2xl border border-neutral-900 mb-8 text-left text-xs font-mono text-neutral-400 space-y-2">
          <div className="text-neutral-500">REASON FOR FAILURE:</div>
          <div className="text-rose-300 leading-relaxed">{error.reason}</div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => searchName ? triggerResearch(searchName) : navigate('/')}
            className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-6 py-2.5 rounded-xl flex items-center space-x-2 text-sm transition shadow-lg shadow-violet-600/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Analysis</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 px-6 py-2.5 rounded-xl flex items-center space-x-2 text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </button>
        </div>
      </div>
    );
  }

  const {
    profile = {},
    financialData = {},
    newsSummary = {},
  } = report || {};

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col justify-between">
      
      {/* Top Navbar */}
      <header className="w-full bg-neutral-950/80 border-b border-neutral-900 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
              Ω
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-mono">AlphaLens</span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-neutral-900 p-1 rounded-xl border border-neutral-850">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'report' ? 'bg-violet-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Research Report Dashboard
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'compare' ? 'bg-violet-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Company Comparison
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'saved' ? 'bg-violet-600 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Saved Reports
            </button>
          </div>

          {/* Top Actions */}
          {report && activeTab === 'report' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopy}
                className="rounded-xl border border-neutral-850 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                title="Copy Summary"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleShare}
                className="rounded-xl border border-neutral-850 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                title="Share Report Link"
              >
                {shared ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handlePrint}
                className="rounded-xl border border-neutral-850 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                title="Print Report as PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveReport}
                className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                {saved ? <Check className="mr-1 inline h-3.5 w-3.5" /> : null}
                Save Report
              </button>
              <button
                onClick={handleCompareCompany}
                className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
              >
                Compare Company
              </button>
              <button
                onClick={handleOpenSavedReports}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-800"
              >
                Saved Reports
              </button>
            </div>
          )}
        </div>
      </header>
       <button
                onClick={handlePrint}
                className="rounded-xl border border-neutral-850 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                title="Print Report as PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="rounded-xl border border-neutral-850 bg-neutral-900 p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
                title="Download Report as TXT"
              >
                <Download className="w-4 h-4" />
              </button>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        
        {/* Partial Node Failure Alert Banner */}
        {report && report.failedNodes && Object.keys(report.failedNodes).length > 0 && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start space-x-3 text-amber-400 text-xs">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Partial Report Output:</span> The multi-agent workflow encountered minor execution issues during the run. The dashboard displays available cached fallback details.
              <ul className="list-disc list-inside mt-2 font-mono text-[10px] space-y-1">
                {Object.entries(report.failedNodes).map(([node, err]: any) => (
                  <li key={node}>{node}: {err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* TAB 1: RESEARCH REPORT DASHBOARD */}
          {activeTab === 'report' && report && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              
              {/* Left Column: Recommendations & Risk */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* 4. Final AI Recommendation Card */}
                <div className={`p-6 rounded-3xl glass border-t-8 shadow-xl overflow-hidden relative ${
                  report.recommendation?.action === 'INVEST' ? 'border-t-emerald-500' : 'border-t-rose-500'
                }`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-600/10 to-transparent blur-xl" />

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Final Decision</span>
                      <h2 className={`text-4xl font-black tracking-tight mt-1 ${
                        report.recommendation?.action === 'INVEST' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {report.recommendation?.action}
                      </h2>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[9px] uppercase font-mono text-neutral-500">Confidence</span>
                      <span className={`text-xl font-bold font-mono mt-1 px-3 py-1 rounded-xl ${
                        report.recommendation?.action === 'INVEST' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {report.recommendation?.confidence}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 italic mb-6 leading-relaxed bg-neutral-900/40 p-4 rounded-2xl border border-neutral-900">
                    "{report.recommendation?.summary}"
                  </p>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-2">Strengths</span>
                      <ul className="space-y-1.5 text-xs text-neutral-300">
                        {report.recommendation?.pros?.map((p: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="text-emerald-500 mr-2">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-neutral-900 pt-4">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block mb-2">Weaknesses</span>
                      <ul className="space-y-1.5 text-xs text-neutral-300">
                        {report.recommendation?.cons?.map((c: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="text-rose-500 mr-2">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-neutral-900 pt-4 mt-6">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-2">Long-Term Outlook</span>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {report.recommendation?.longTermOutlook}
                    </p>
                  </div>
                </div>

                {/* 3. Risk Analysis Section */}
                <div className="p-6 rounded-3xl glass space-y-4">
                  <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Risk Severity Ratings</span>
                  </h3>

                  <div className="space-y-3">
                    {[
                      { name: 'Competition', val: report.riskAnalysis?.competition },
                      { name: 'Financial Risks', val: report.riskAnalysis?.financial },
                      { name: 'Market Volatility', val: report.riskAnalysis?.volatility },
                      { name: 'Regulatory Risks', val: report.riskAnalysis?.regulatory },
                      { name: 'Industry Outlook', val: report.riskAnalysis?.challenges },
                    ].map((risk, idx) => {
                      const sev = getRiskSeverity(risk.name, risk.val || '');
                      return (
                        <div key={idx} className={`p-3 rounded-xl border-l-4 border ${sev.style} border-neutral-900`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-xs text-neutral-200">{risk.name}</span>
                            <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-neutral-900 rounded border border-neutral-800">
                              {sev.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-relaxed">{risk.val || 'No data generated.'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Financials, Profile, News, Chats */}
              <div className="lg:col-span-2 space-y-6">

                {/* 1. Company Profile Header & Key metrics */}
                <div className="p-6 rounded-3xl glass relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-900 pb-6 mb-6 gap-4">
                    <div className="flex items-center space-x-4">
                      {/* Stylized Logo Placeholder */}
                      <div className="w-14 h-14 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg">
                        {report.ticker?.slice(0, 2)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white leading-tight">{report.companyName}</h2>
                        <div className="flex items-center space-x-2 text-xs text-neutral-500 font-mono mt-1">
                          <Building className="w-3.5 h-3.5" />
                          <span>{profile.industry} | {profile.sector}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Current Share Price</span>
                      <div className="text-3xl font-black text-white font-mono mt-1">{financialData.currentPrice}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-neutral-500 flex items-center gap-1"><User className="w-3 h-3" /> CEO</span>
                      <span className="font-semibold text-neutral-200 mt-0.5 block">{profile.ceo}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Headquarters</span>
                      <span className="font-semibold text-neutral-200 mt-0.5 block">{profile.headquarters}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">52 Week High</span>
                      <span className="font-semibold text-neutral-200 mt-0.5 block font-mono">{financialData.fiftyTwoWeekHigh}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">52 Week Low</span>
                      <span className="font-semibold text-neutral-200 mt-0.5 block font-mono">{financialData.fiftyTwoWeekLow}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 mt-4 leading-relaxed border-t border-neutral-900 pt-4">
                    {profile.description}
                  </p>
                </div>

                {/* Financial Metric Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Market Cap', value: financialData.marketCap },
                    { label: 'Annual Revenue', value: financialData.revenue },
                    { label: 'Revenue Growth', value: financialData.revenueGrowth },
                    { label: 'Net Profit', value: financialData.netProfit },
                    { label: 'Profit Margin', value: financialData.profitMargin },
                    { label: 'PE Ratio', value: financialData.peRatio },
                    { label: 'EPS', value: financialData.eps },
                    { label: 'Dividend Yield', value: financialData.dividendYield || 'N/A' },
                  ].map((metric, idx) => (
                    <div key={idx} className="p-4 bg-neutral-900/60 border border-neutral-900 rounded-2xl text-center">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono block">{metric.label}</span>
                      <span className="text-base font-bold text-white mt-1 block font-mono">{metric.value || 'N/A'}</span>
                    </div>
                  ))}
                </div>

                {/* 5. Interactive Charts Tabs inside card */}
                <div className="p-6 rounded-3xl glass space-y-6">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
                    <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase flex items-center space-x-2">
                      <BarChart2 className="w-4 h-4 text-violet-400" />
                      <span>Interactive Financial Charts</span>
                    </h3>
                  </div>

                  {/* Row showing charts side-by-side or stacked */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Share Price Chart (Area) */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-400 mb-3">Stock Price History (30 Days)</div>
                      {financialData.history && financialData.history.length > 0 ? (
                        <div className="w-full h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={financialData.history}>
                              <defs>
                                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                              <XAxis dataKey="date" stroke="#525252" fontSize={8} />
                              <YAxis stroke="#525252" fontSize={8} domain={['auto', 'auto']} />
                              <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', fontSize: 10 }} />
                              <Area type="monotone" dataKey="close" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#priceGradient)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-xs text-neutral-600 border border-neutral-900 rounded-2xl italic">No historical price details loaded.</div>
                      )}
                    </div>

                    {/* Revenue & Profit Trends (Bar) */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-400 mb-3">Annual Revenue & Profit Trends</div>
                      {financialData.annualTrends && financialData.annualTrends.length > 0 ? (
                        <div className="w-full h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData.annualTrends}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                              <XAxis dataKey="year" stroke="#525252" fontSize={8} />
                              <YAxis stroke="#525252" fontSize={8} width={45} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', fontSize: 10 }}
                                formatter={(value: any) => [`$${(value / 1.0e9).toFixed(2)}B`, '']}
                              />
                              <Legend wrapperStyle={{ fontSize: 9 }} />
                              <Bar dataKey="revenue" fill="#6366f1" name="Revenue" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="profit" fill="#10b981" name="Net Profit" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-xs text-neutral-600 border border-neutral-900 rounded-2xl italic">No annual data details loaded.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. News Analysis */}
                <div className="p-6 rounded-3xl glass space-y-6">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
                    <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
                      News Summary & Market Sentiment
                    </h3>
                    <span className="text-xs px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full font-bold">
                      Sentiment: {newsSummary.sentiment}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                    <div className="space-y-3">
                      <span className="font-bold text-emerald-400 uppercase tracking-wider block">Positive Indicators</span>
                      <ul className="space-y-2 text-neutral-300">
                        {newsSummary.positive?.map((p: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <span className="font-bold text-rose-400 uppercase tracking-wider block">Negative Indicators</span>
                      <ul className="space-y-2 text-neutral-300">
                        {newsSummary.negative?.map((n: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <TrendingDown className="w-3.5 h-3.5 text-rose-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{n}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Headlines list */}
                  {newsSummary.sources && newsSummary.sources.length > 0 && (
                    <div className="border-t border-neutral-900 pt-4">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 block mb-3">Latest Headlines</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {newsSummary.sources.map((src: any, idx: number) => (
                          <a
                            key={idx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-neutral-900/40 border border-neutral-900 rounded-xl flex justify-between items-center hover:bg-neutral-900/80 transition"
                          >
                            <span className="truncate max-w-[85%] text-neutral-300 font-medium">{src.title}</span>
                            <Plus className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 8. AI Follow-up Chat Component */}
                <div className="p-6 rounded-3xl glass flex flex-col h-[400px]">
                  <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase mb-4 flex items-center space-x-2 border-b border-neutral-900 pb-3">
                    <MessageCircle className="w-4 h-4 text-violet-400" />
                    <span>AI Analyst Interactive Chat</span>
                  </h3>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scroll-area">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-violet-600 text-white shadow-lg'
                              : 'bg-neutral-900 border border-neutral-850 text-neutral-300'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-neutral-900 border border-neutral-850 text-neutral-400 rounded-xl p-3 text-xs flex items-center space-x-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
                          <span>AI is reviewing report data...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick recommendation prompts */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      'Why did you recommend INVEST?',
                      'What are the biggest risks?',
                      'Should I invest long term?',
                    ].map((promptText, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setChatInput(promptText);
                        }}
                        className="text-[10px] text-violet-400 hover:text-white bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 px-2.5 py-1 rounded-full transition"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>

                  {/* Chat Form */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask the analyst anything about this equity..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={chatLoading}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 outline-none focus:border-violet-500 transition"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatInput.trim()}
                      className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition flex items-center justify-center"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>
                  </form>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: COMPANY COMPARISON */}
          {activeTab === 'compare' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="p-6 rounded-3xl glass max-w-xl mx-auto text-center space-y-4">
                <h3 className="text-xl font-bold tracking-tight text-white">Compare Companies Side-by-Side</h3>
                <p className="text-xs text-neutral-400">
                  Select a second company to perform competitive analysis alongside <span className="font-bold text-violet-400">{report ? report.companyName : 'the currently loaded report'}</span>.
                </p>

                <form onSubmit={handleCompareSearch} className="flex gap-2 justify-center">
                  <input
                    type="text"
                    placeholder="Enter ticker or name (e.g. TSLA, NVDA)..."
                    value={compareCompanyQuery}
                    onChange={(e) => setCompareCompanyQuery(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-xs outline-none text-white focus:border-violet-500 max-w-xs w-full"
                  />
                  <button
                    type="submit"
                    disabled={compareLoading || !compareCompanyQuery.trim()}
                    className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {compareLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Compare</span>
                  </button>
                </form>

                {compareError && <div className="text-xs text-rose-400 font-mono">{compareError}</div>}
              </div>

              {/* Side-by-Side Table Grid */}
              {report && (
                <div className="p-6 rounded-3xl glass overflow-x-auto shadow-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-900 text-neutral-400 uppercase tracking-widest text-[10px] font-bold">
                        <th className="py-4 pr-4">Metrics</th>
                        <th className="py-4 pr-4 text-violet-400">{report.companyName} ({report.ticker})</th>
                        <th className="py-4">
                          {compareReport ? `${compareReport.companyName} (${compareReport.ticker})` : 'Comparison Target'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900/60 font-medium">
                      <tr>
                        <td className="py-4 pr-4 font-semibold text-neutral-400">Recommendation</td>
                        <td className={`py-4 pr-4 font-bold ${report.recommendation?.action === 'INVEST' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {report.recommendation?.action} ({report.recommendation?.confidence}%)
                        </td>
                        <td className={`py-4 font-bold ${compareReport ? (compareReport.recommendation?.action === 'INVEST' ? 'text-emerald-400' : 'text-rose-400') : 'text-neutral-600'}`}>
                          {compareReport ? `${compareReport.recommendation?.action} (${compareReport.recommendation?.confidence}%)` : '—'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 pr-4 font-semibold text-neutral-400">Market Cap</td>
                        <td className="py-4 pr-4 font-mono">{report.financialData?.marketCap}</td>
                        <td className="py-4 font-mono">{compareReport ? compareReport.financialData?.marketCap : '—'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 pr-4 font-semibold text-neutral-400">Annual Revenue</td>
                        <td className="py-4 pr-4 font-mono">{report.financialData?.revenue}</td>
                        <td className="py-4 font-mono">{compareReport ? compareReport.financialData?.revenue : '—'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 pr-4 font-semibold text-neutral-400">Revenue Growth</td>
                        <td className="py-4 pr-4 font-mono text-neutral-300">{report.financialData?.revenueGrowth}</td>
                        <td className="py-4 font-mono text-neutral-300">{compareReport ? compareReport.financialData?.revenueGrowth : '—'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 pr-4 font-semibold text-neutral-400">PE Ratio</td>
                        <td className="py-4 pr-4 font-mono">{report.financialData?.peRatio}</td>
                        <td className="py-4 font-mono">{compareReport ? compareReport.financialData?.peRatio : '—'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 pr-4 font-semibold text-neutral-400">Overall Sentiment</td>
                        <td className="py-4 pr-4 text-violet-400">{report.newsSummary?.sentiment}</td>
                        <td className="py-4 text-violet-400">{compareReport ? compareReport.newsSummary?.sentiment : '—'}</td>
                      </tr>
                      <tr>
                        <td className="py-4 pr-4 font-semibold text-neutral-400">Industry Outlook</td>
                        <td className="py-4 pr-4 text-neutral-400 max-w-[280px] leading-relaxed">{report.riskAnalysis?.challenges}</td>
                        <td className="py-4 text-neutral-400 max-w-[280px] leading-relaxed">
                          {compareReport ? compareReport.riskAnalysis?.challenges : '—'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: SAVED REPORTS */}
          {activeTab === 'saved' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
            >
              
              {/* Reports list */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center space-x-2 border-b border-neutral-900 pb-3 mb-4">
                  <Database className="w-5 h-5 text-violet-400" />
                  <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
                    Saved Equity Reports
                  </h3>
                </div>

                {savedReports.length === 0 ? (
                  <div className="p-8 text-center italic text-neutral-600 glass rounded-2xl">
                    No reports saved yet. Run some searches to generate details.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedReports.map((saved) => (
                      <div
                        key={saved._id}
                        className="p-5 rounded-2xl glass border border-neutral-900 hover:border-neutral-800 transition flex flex-col justify-between h-40 shadow-lg relative group"
                      >
                        <div className="absolute top-4 right-4 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleDeleteReport(saved._id)}
                            className="p-1.5 bg-neutral-950 border border-neutral-900 hover:text-rose-400 hover:border-rose-500/20 rounded transition"
                            title="Delete Report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-[10px] text-neutral-500">
                              {new Date(saved.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`text-[9px] uppercase font-bold font-mono px-2 py-0.5 rounded ${
                              saved.recommendation?.action === 'INVEST' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {saved.recommendation?.action}
                            </span>
                          </div>

                          <h4 className="text-base font-black text-white">{saved.companyName}</h4>
                          <span className="font-mono text-xs text-neutral-500">{saved.ticker}</span>
                        </div>

                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => {
                              setSearchParams({ reportId: saved._id });
                              setActiveTab('report');
                            }}
                            className="px-3.5 py-1.5 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 text-violet-400 hover:text-white rounded-lg text-xs font-semibold transition"
                          >
                            Open Report
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History list */}
              <div className="md:col-span-1 space-y-4 border-l border-neutral-900/60 pl-0 md:pl-8">
                <div className="flex items-center space-x-2 border-b border-neutral-900 pb-3 mb-4">
                  <FileText className="w-5 h-5 text-violet-400" />
                  <h3 className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
                    Recent Search History
                  </h3>
                </div>

                {searchHistory.length === 0 ? (
                  <p className="text-xs text-neutral-600 italic">No search logs yet.</p>
                ) : (
                  <div className="space-y-2">
                    {searchHistory.map((hist, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSearchParams({ search: hist.companyName });
                          setActiveTab('report');
                        }}
                        className="p-3 bg-neutral-900/30 border border-neutral-900 hover:border-neutral-850 hover:bg-neutral-900/80 rounded-xl flex justify-between items-center cursor-pointer transition text-xs"
                      >
                        <span className="font-semibold text-neutral-300">{hist.companyName}</span>
                        <span className="text-[10px] text-neutral-600 font-mono">
                          {new Date(hist.searchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 border-t border-neutral-900 text-center text-xs text-neutral-600 font-mono">
        &copy; {new Date().getFullYear()} AlphaLens. Dynamic multi-agent execution with Groq and FMP.
      </footer>
    </div>
  );
};
