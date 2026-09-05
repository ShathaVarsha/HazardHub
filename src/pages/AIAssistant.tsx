import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AIOperationsAgent, type AgentMessage } from '../agent/agent';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Terminal, 
  ArrowRight, 
  Cpu,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const AIAssistant: React.FC = () => {
  const { setActiveTab } = useAppStore();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'init-1',
      sender: 'AGENT',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `Greetings! I am your **HazardHub AI Operations Dispatcher**. 

I coordinate shared hazardous waste pickups across all 8 local facilities while delegating all safety decisions to our deterministic engines (**ChemiGuard**, **QuotaPacker**, and **ResilienceGuard**).

Try asking me:
- *"Can we create a pickup lot for tomorrow?"*
- *"What urgent waste is expiring soon?"*
- *"Can we mix Nitric Acid with Acetone?"*
- *"Check regional pooling readiness"*`,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isProcessing) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const agentReply = await AIOperationsAgent.processQuery(query);
      setMessages((prev) => [...prev, agentReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'AGENT',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: 'An error occurred while communicating with the operations tools.',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const samplePrompts = [
    'Can we create a pickup lot for tomorrow?',
    'What urgent waste is expiring soon?',
    'Can we mix Nitric Acid with Acetone?',
    'Summarize regional township pool readiness',
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E6F8F3] text-[#007A5E] border border-[#A3E8D5] shadow-xs">
            <Bot className="w-5 h-5 text-[#007A5E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#0A192F] tracking-tight">AI Operations Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E6F8F3] text-[#006B4E] border border-[#A3E8D5]">
                Agentic Tool-Calling Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Controlled GenAI operations assistant orchestrating deterministic safety &amp; optimization engines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden sm:inline">Zero-Hallucination Guardrails</span>
          <Cpu className="w-3.5 h-3.5 text-teal-600 ml-1 sm:ml-0" />
        </div>
      </div>

      {/* Message Chat Log */}
      <div className="flex-1 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-sm">
        {messages.map((msg) => {
          const isUser = msg.sender === 'USER';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4 text-teal-600" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 space-y-2.5 shadow-xs ${
                  isUser
                    ? 'bg-teal-600 text-white font-medium font-sans'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                  <span className="font-bold tracking-wide uppercase">
                    {isUser ? 'Lab Technician' : 'HazardHub AI Agent'}
                  </span>
                  <span className="font-mono">{msg.timestamp}</span>
                </div>

                {/* Message Body */}
                <div className="whitespace-pre-line text-xs font-sans leading-relaxed">
                  {msg.content}
                </div>

                {/* Visible Tool Call Feedback Cards (High-contrast code terminal block) */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-teal-800 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-teal-600" />
                      <span>Executed Deterministic Engine Call:</span>
                    </span>
                    {msg.toolCalls.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 text-slate-800 border border-slate-200/90 font-mono text-[11px] space-y-1 shadow-xs"
                      >
                        <div className="flex items-center justify-between text-teal-800">
                          <span className="font-bold">{t.toolName}()</span>
                          <span className="text-emerald-700 text-[10px] flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Engine Output
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-sans">{t.summary}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Action Suggestion Button */}
                {msg.actionSuggestion && (
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab(msg.actionSuggestion!.tab)}
                      className="w-full py-2 px-3.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <span>{msg.actionSuggestion.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-700" />
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2.5 text-xs text-teal-800 font-mono py-1.5 px-3 rounded-xl bg-teal-50 border border-teal-200 inline-flex animate-pulse">
            <Bot className="w-4 h-4 animate-spin text-teal-600" />
            <span>Consulting deterministic engines (ChemiGuard & QuotaPacker)...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
        <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-600" /> Quick Inquiries:
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium transition-all shadow-xs cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask operations dispatcher (e.g. 'Can we create a pickup lot for tomorrow?')..."
          className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-200 transition-all shadow-xs"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isProcessing}
          className="px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold flex items-center justify-center shadow-sm shadow-teal-600/20 transition-all cursor-pointer disabled:cursor-not-allowed"
          title="Send query"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
};
