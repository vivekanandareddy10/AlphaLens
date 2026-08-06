import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Percent, Newspaper, ShieldAlert, CheckSquare } from 'lucide-react';

interface AgentProgressProps {
  companyName: string;
}

const STEPS = [
  { id: 'research', label: 'Research Agent', desc: 'Finding ticker & profile details...', icon: Search, color: 'text-blue-400', ring: 'shadow-blue-500/40' },
  { id: 'finance', label: 'Financial Data Agent', desc: 'Fetching financial metrics & price history...', icon: Percent, color: 'text-emerald-400', ring: 'shadow-emerald-500/40' },
  { id: 'news', label: 'News Analysis Agent', desc: 'Scouring Tavily & summarizing sentiment...', icon: Newspaper, color: 'text-amber-400', ring: 'shadow-amber-500/40' },
  { id: 'risk', label: 'Risk Analysis Agent', desc: 'Evaluating regulatory & industry bottlenecks...', icon: ShieldAlert, color: 'text-rose-400', ring: 'shadow-rose-500/40' },
  { id: 'decision', label: 'Decision Agent', desc: 'Synthesizing report & final rating...', icon: CheckSquare, color: 'text-violet-400', ring: 'shadow-violet-500/40' },
];

const STEP_DURATION_MS = 4500;
const TICK_MS = 70;
const TICK_INCREMENT = (TICK_MS / STEP_DURATION_MS) * 100;
const FINAL_STEP_HOLD_PCT = 92;

export const AgentProgress: React.FC<AgentProgressProps> = ({ companyName }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [subProgress, setSubProgress] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => {
      setSubProgress((prev) => {
        const isLastStep = currentStep === STEPS.length - 1;

        if (isLastStep) {
          return Math.min(prev + TICK_INCREMENT, FINAL_STEP_HOLD_PCT);
        }

        if (prev >= 100) {
          setCurrentStep((cs) => Math.min(cs + 1, STEPS.length - 1));
          return 0;
        }

        return prev + TICK_INCREMENT;
      });
    }, TICK_MS);

    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const overallPct = Math.min(
    100,
    Math.round(((currentStep + subProgress / 100) / STEPS.length) * 100)
  );

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-lg mx-auto glass rounded-2xl border border-neutral-800 text-center shadow-2xl my-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
        className="w-16 h-16 border-t-2 border-r-2 border-violet-500 rounded-full mb-6 flex items-center justify-center"
      >
        <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-xs text-neutral-400 font-mono">
          AI
        </div>
      </motion.div>

      <h3 className="text-xl font-semibold mb-2">Analyzing {companyName}</h3>
      <p className="text-sm text-neutral-400 mb-6 max-w-xs">
        Our multi-agent system is performing deep research. This may take up to 25 seconds...
      </p>

      <div className="w-full flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wide text-neutral-500">Overall progress</span>
        <span className="text-[10px] font-mono text-violet-300">{overallPct}%</span>
      </div>
      <div className="h-1 w-full bg-neutral-800 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 via-indigo-400 to-emerald-400 rounded-full"
          animate={{ width: `${overallPct}%` }}
          transition={{ ease: 'easeOut', duration: 0.15 }}
        />
      </div>

      <div className="relative w-full text-left">
        <div className="absolute left-[22px] top-2 bottom-2 w-px bg-neutral-800" />

        <div className="space-y-1">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            const localPct = isActive ? subProgress : isCompleted ? 100 : 0;

            return (
              <div key={step.id} className="relative flex items-start py-2.5">
                <motion.div
                  animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ repeat: isActive ? Infinity : 0, duration: 1.1 }}
                  className={`relative z-10 mr-4 w-11 h-11 flex items-center justify-center rounded-full border transition-colors duration-300
                    ${
                      isCompleted
                        ? 'bg-emerald-500/15 border-emerald-500/40'
                        : isActive
                        ? `bg-neutral-900 border-neutral-700 shadow-lg ${step.ring}`
                        : 'bg-neutral-900 border-neutral-800'
                    }`}
                >
                  {isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <StepIcon className={`w-5 h-5 ${isActive ? step.color : 'text-neutral-600'}`} />
                  )}
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-violet-500/40"
                      animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
                    />
                  )}
                </motion.div>

                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? 'text-neutral-400' : isActive ? 'text-white' : 'text-neutral-600'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCompleted && (
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Completed
                      </span>
                    )}
                    {isActive && (
                      <span className="text-[10px] font-mono text-neutral-500">{Math.round(localPct)}%</span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 transition-colors ${isActive ? 'text-neutral-400' : 'text-neutral-600'}`}>
                    {step.desc}
                  </p>
                  {isActive && (
                    <div className="h-0.5 w-full bg-neutral-800 rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className={`h-full bg-current ${step.color}`}
                        animate={{ width: `${localPct}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};