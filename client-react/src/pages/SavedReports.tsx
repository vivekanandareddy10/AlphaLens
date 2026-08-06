import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, FileText, Search, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export const SavedReports: React.FC = () => {
  const navigate = useNavigate();
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const reports = await api.getReports();
        const history = await api.getHistory();
        setSavedReports(reports);
        setSearchHistory(history);
      } catch (err) {
        console.error('Failed to load saved reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDeleteReport = async (id: string) => {
    try {
      await api.deleteReport(id);
      setSavedReports((prev) => prev.filter((report) => report._id !== id));
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/research-report')}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition hover:text-white"
              title="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Archive</p>
              <h1 className="text-xl font-semibold text-white">Saved Research Reports</h1>
            </div>
          </div>
          <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
            MongoDB-backed storage
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
          <section className="rounded-3xl border border-neutral-900 bg-neutral-900/60 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-2 border-b border-neutral-900 pb-3">
              <Database className="h-5 w-5 text-violet-400" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">Saved Reports</h2>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6 text-sm text-neutral-500">
                Loading your report archive...
              </div>
            ) : savedReports.length === 0 ? (
              <div className="rounded-2xl border border-neutral-900 bg-neutral-950/60 p-6 text-sm text-neutral-500">
                No saved reports yet. Complete an analysis to populate this list.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {savedReports.map((report) => (
                  <div key={report._id} className="rounded-2xl border border-neutral-900 bg-neutral-950/70 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{report.companyName}</p>
                        <p className="text-xs text-neutral-500">{report.ticker || 'N/A'}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${report.recommendation?.action === 'INVEST' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {report.recommendation?.action || 'PENDING'}
                      </span>
                    </div>

                    <div className="mb-4 text-xs text-neutral-400">
                      <p>{report.profile?.industry || 'Industry unavailable'}</p>
                      <p>{new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/research-report?reportId=${report._id}`)}
                        className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report._id)}
                        className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-400 transition hover:text-rose-400"
                      >
                        <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-neutral-900 bg-neutral-900/60 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-2 border-b border-neutral-900 pb-3">
              <FileText className="h-5 w-5 text-violet-400" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">Search History</h2>
            </div>

            {searchHistory.length === 0 ? (
              <p className="text-sm text-neutral-500">No recent searches yet.</p>
            ) : (
              <div className="space-y-2">
                {searchHistory.map((item, index) => (
                  <button
                    key={`${item.companyName}-${index}`}
                    onClick={() => navigate(`/research-report?search=${encodeURIComponent(item.companyName)}`)}
                    className="flex w-full items-center justify-between rounded-xl border border-neutral-900 bg-neutral-950/70 px-3 py-3 text-left text-sm text-neutral-300 transition hover:border-violet-500/20 hover:bg-neutral-900"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="h-3.5 w-3.5 text-violet-400" />
                      {item.companyName}
                    </span>
                    <span className="text-[10px] text-neutral-500">{new Date(item.searchedAt).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};
