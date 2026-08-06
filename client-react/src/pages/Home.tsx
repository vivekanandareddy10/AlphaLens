import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, TrendingUp, History as HistoryIcon, ArrowRight, Trash2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_SUGGESTIONS = ['Apple', 'Tesla', 'Nvidia', 'Microsoft', 'Amazon'];

export const Home: React.FC = () => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredReportId, setHoveredReportId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const histData = await api.getHistory();
      setHistory(histData);

      const repData = await api.getReports();
      setReports(repData);
    } catch (err) {
      console.error('Failed to load initial history/reports:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    navigate(`/research-report?search=${encodeURIComponent(query)}`);
  };

  const handleSelectHistory = (name: string) => {
    navigate(`/research-report?search=${encodeURIComponent(name)}`);
  };

  const handleSelectReport = (id: string) => {
    navigate(`/research-report?reportId=${id}`);
  };

  const handleDeleteReport = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.deleteReport(id);
      setReports(reports.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-200 overflow-hidden flex flex-col justify-between">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px]" />

      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-neutral-900">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">
            Ω
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-mono">AlphaLens</span>
        </div>
        <div className="text-xs text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800 font-mono">
          Model: Groq + LangGraph
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-16 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center space-x-2 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full text-violet-400 text-xs font-medium">
            <Flame className="w-3.5 h-3.5" />
            <span>Autonomous Multi-Agent Equity Research</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Institutional-Grade <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent">
              Investment Research Agents
            </span>
          </h1>

          <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto">
            Input any corporation. Our autonomous AI workflow researches historical financials, scrapes positive & negative news, identifies risks, and outputs a recommendation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-2xl mt-10 relative"
        >
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-30 group-focus-within:opacity-50 transition duration-300" />
            <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-2xl p-2 pl-4">
              <Search className="w-5 h-5 text-neutral-500 mr-3" />
              <input
                type="text"
                placeholder="Search by company name (e.g. Apple, Tesla, Nvidia)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                className="bg-transparent border-0 outline-none w-full text-neutral-100 placeholder-neutral-500 text-base py-2 focus:ring-0"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="bg-violet-600 hover:bg-violet-500 text-white font-medium px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center space-x-2 text-sm shadow-lg shadow-violet-600/35 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                <span>Research</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <AnimatePresence>
            {searchFocused && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl p-2 z-20 shadow-xl"
              >
                <div className="text-[10px] font-mono uppercase text-neutral-600 px-2 pb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {query ? 'Matching' : 'Suggested'}
                </div>
                {(() => {
                  const pool = history.length
                    ? history.map((h) => h.companyName)
                    : DEFAULT_SUGGESTIONS;
                  const matches = query
                    ? pool.filter((name: string) => name.toLowerCase().includes(query.toLowerCase()))
                    : pool.slice(0, 5);

                  if (matches.length === 0) {
                    return (
                      <div className="text-xs text-neutral-600 px-2 py-1.5">
                        No matches — press Research to search anyway
                      </div>
                    );
                  }

                  return matches.map((name: string) => (
                    <button
                      key={name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuery(name);
                        navigate(`/research-report?search=${encodeURIComponent(name)}`);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition flex items-center justify-between"
                    >
                      {name}
                      <span className="text-[10px] text-neutral-600 font-mono">↵</span>
                    </button>
                  ));
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="w-full max-w-3xl mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 text-neutral-400 border-b border-neutral-900 pb-2">
              <HistoryIcon className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-wide uppercase">Recent Searches</span>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-neutral-600 italic">No search history yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {history.map((hist, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectHistory(hist.companyName)}
                    className="glass glass-hover text-xs text-neutral-300 px-3 py-1.5 rounded-lg border border-neutral-800 transition"
                  >
                    {hist.companyName}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 text-neutral-400 border-b border-neutral-900 pb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-wide uppercase">Saved Research Reports</span>
            </div>

            {reports.length === 0 ? (
              <p className="text-xs text-neutral-600 italic">No saved reports found.</p>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
                {reports.map((report) => {
                  const isInvest = report.recommendation?.action === 'INVEST';
                  const isHovered = hoveredReportId === report._id;
                  return (
                    <motion.div
                      key={report._id}
                      onClick={() => handleSelectReport(report._id)}
                      onMouseEnter={() => setHoveredReportId(report._id)}
                      onMouseLeave={() => setHoveredReportId(null)}
                      whileHover={{ y: -2 }}
                      className="relative rounded-xl p-[1px] cursor-pointer overflow-hidden transition-[background] duration-300"
                      style={{
                        background: isHovered
                          ? isInvest
                            ? 'linear-gradient(120deg, rgba(16,185,129,0.6), rgba(124,58,237,0.4), transparent)'
                            : 'linear-gradient(120deg, rgba(244,63,94,0.6), rgba(124,58,237,0.4), transparent)'
                          : 'transparent',
                      }}
                    >
                      <div className="bg-neutral-900/70 backdrop-blur p-3 rounded-[11px] flex items-center justify-between text-xs border border-neutral-850/60">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold ${
                              isInvest ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {report.ticker?.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-200">
                              {report.companyName} <span className="text-neutral-500 font-normal">({report.ticker})</span>
                            </div>
                            <div className="text-neutral-500 text-[10px] mt-0.5">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`font-mono px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                              isInvest ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {isInvest && <TrendingUp className="w-2.5 h-2.5" />}
                            {report.recommendation?.action}
                          </span>
                          <motion.button
                            onClick={(e) => handleDeleteReport(e, report._id)}
                            animate={{ opacity: isHovered ? 1 : 0.35 }}
                            className="text-neutral-600 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-neutral-900 text-center text-xs text-neutral-600 font-mono">
        &copy; {new Date().getFullYear()} AlphaLens. Built with LangGraph.js, Groq, FMP, and Mongoose.
      </footer>
    </div>
  );
};