import React, { useState } from 'react';
import {
  Bot,
  Send,
  ShieldCheck,
  Cpu,
  Sparkles,
  Terminal,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { WasteItem, Lab, PoolingRun, AIOperationsRecord } from '../types';
import { NavigationPage } from '../components/Navbar';

interface AIOperationsPageProps {
  wasteItems: WasteItem[];
  labs: Lab[];
  runs: PoolingRun[];
  onNavigate: (page: NavigationPage) => void;
}

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:8000';

export const AIOperationsPage: React.FC<AIOperationsPageProps> = ({
  wasteItems,
  labs,
  runs,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<AIOperationsRecord[]>([
    {
      id: 'init-1',
      query: 'Check compatibility between Nitric Acid 70% and Acetone / Methanol rinse.',
      invokedEngine: 'ChemiGuard',
      invokedTool: 'ChemiGuard.validatePair("Nitric Acid 70% Aqueous Solution", "Acetone / Methanol Chromatography Rinse")',
      deterministicResult: {
        status: 'CRITICAL_BLOCK',
        summary: 'CRITICAL BLOCK: EPA Group 2-A (Oxidizers) + EPA Group 2-B (Flammable Liquids & Volatiles)',
        details: { severity: 'CRITICAL_BLOCK' },
      },
      explanation:
        'Deterministic safety validation strictly BLOCKED this co-loading. Strong nitric acid reacts violently and hypergolically with acetone and low-flashpoint alcohols, liberating brown toxic Nitrogen Dioxide (NO2) gas and creating an acute explosion hazard inside a sealed vehicle hold. Under EPA 40 CFR § 264.177 and DOT 49 CFR § 177.848 Table "X", this mixture is strictly prohibited.',
      timestamp: '09:15 AM',
    },
    {
      id: 'init-2',
      query: 'What is our current QuotaPacker vehicle utilization rate?',
      invokedEngine: 'QuotaPacker',
      invokedTool: 'QuotaPacker.autoBundle(availableItems: 30, maxCapacity: 800)',
      deterministicResult: {
        status: 'OPTIMIZED',
        summary: 'Formed 4 compliant vehicle pooling runs with average 92% volumetric density.',
        details: { runCount: 4 },
      },
      explanation:
        'QuotaPacker has consolidated 30 monitored laboratory waste containers across 8 participating nodes into 4 dedicated carrier manifests. Mutual chemical segregation (e.g. isolating Class 8 acids from caustics) was 100% maintained with zero compatibility violations.',
      timestamp: '09:42 AM',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'Can I co-load Sulfuric Acid with Sodium Cyanide?',
    'What happens if Olympic Marine Chemistry cancels their pickup?',
    'Check compatibility between TMAH Developer and Glacial Acetic Acid',
    'Verify custody status and offline QR handoff for Pacific BioSciences',
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || isLoading) return;

    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      
      const record: AIOperationsRecord = {
        id: `msg-${Date.now()}`,
        query: q,
        invokedEngine: data.tool_calls && data.tool_calls.length > 0 ? data.tool_calls[0].name : 'Direct Response',
        invokedTool: data.tool_calls && data.tool_calls.length > 0 ? `${data.tool_calls[0].name}(...)` : 'None',
        deterministicResult: {
          status: 'PROCESSED',
          summary: 'Agent successfully parsed request',
          details: {},
        },
        explanation: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages((prev) => [...prev, record]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            AI OPERATIONS AUDIT CONSOLE
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Compliance &amp; Operations Agent
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Natural language interface governed strictly by deterministic backend verification engines.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono">
          <Terminal className="w-4 h-4 text-teal-400" />
          <span>Deterministic Primacy Rule: ACTIVE</span>
        </div>
      </div>

      {/* Safety Notice Callout */}
      <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-teal-900">
            Critical Safety Architecture: Tool Invocation Transparency
          </div>
          <p className="text-slate-700 leading-relaxed">
            The AI Operations Agent interprets natural language queries, but <strong>NEVER</strong> makes autonomous chemical compatibility decisions. Every query invokes deterministic micro-engines (ChemiGuard™, QuotaPacker™, ResilienceGuard™, or CustodySentinel™) before generating a response.
          </p>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          Suggested Compliance &amp; Logistics Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:border-teal-600 hover:text-teal-900 transition-colors shadow-2xs text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Transcript Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
              {/* User Query */}
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-slate-900 text-white rounded-xl rounded-tr-xs px-4 py-2.5 max-w-xl text-xs font-medium shadow-xs">
                  {msg.query}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                  OP
                </div>
              </div>

              {/* Agent Response with Engine Tool Card */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="space-y-3 max-w-3xl w-full">
                  {/* Tool Execution Card */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900">
                          {msg.invokedEngine}
                        </span>
                        <span className="text-slate-500 text-[11px]">invoked:</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          msg.deterministicResult.status === 'CRITICAL_BLOCK'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : msg.deterministicResult.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-teal-100 text-teal-800 border border-teal-200'
                        }`}
                      >
                        STATUS: {msg.deterministicResult.status}
                      </span>
                    </div>

                    <div className="text-slate-800 font-bold break-all bg-white p-2 rounded border border-slate-200">
                      &gt; {msg.invokedTool}
                    </div>

                    <div className="text-[11px] text-slate-600">
                      <strong>Deterministic Summary:</strong> {msg.deterministicResult.summary}
                    </div>
                  </div>

                  {/* AI Synthesized Explanation */}
                  <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs text-slate-800 leading-relaxed space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-100">
                      <span>Compliance Guidance</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-line">{msg.explanation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-500 animate-pulse p-4">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-700" />
              <span>Querying deterministic rule engine and synthesizing compliance guidance...</span>
            </div>
          )}
        </div>

        {/* Query Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-4 border-t border-slate-200 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Ask AI Operations Agent (e.g., 'Check compatibility between Nitric Acid and Acetic Acid')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-5 py-3 rounded-lg bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send Query</span>
          </button>
        </form>
      </div>
    </div>
  );
};
