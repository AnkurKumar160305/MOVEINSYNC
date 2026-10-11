import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Search,
  MessageSquare,
  AlertCircle,
  FileCheck,
  ChevronRight,
  HelpCircle,
  Quote,
} from 'lucide-react';
import { pulseApi } from '../api/client';
import { IAskResponse } from '../types';
import { Badge } from '../components/common/Badge';

export const AIAssistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<IAskResponse | null>(null);

  const predefinedQuestions = [
    'Why did employee ratings drop in recent versions?',
    'What are the top causes of negative reviews?',
    'What should engineering fix first to maximize rating recovery?',
    'What are the main complaints regarding booking and shifts?',
    'How do GPS inaccuracies and late ETA impact employee trust?',
  ];

  const handleAsk = async (qText: string) => {
    if (!qText.trim()) return;
    setLoading(true);
    setQuestion(qText);
    try {
      const data = await pulseApi.askQuestion(qText);
      setResponse(data);
    } catch (err) {
      console.error('Failed to ask question:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] sm:text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Grounded Commute Intelligence Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Ask Pulse AI</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto px-2">
          Query review sentiment and root causes with strict evidence grounding and citation support
        </p>
      </div>

      {/* Query Bar */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-slate-800 space-y-3 sm:space-y-4 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(question);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ask anything about employee commute feedback..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ask Pulse</span>
          </button>
        </form>

        {/* Query Suggestions Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Suggestions:
          </span>
          {predefinedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 transition-all text-[11px]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Answer View */}
      {loading && (
        <div className="glass-card rounded-2xl p-12 border border-slate-800 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">
            Synthesizing review evidence across 500+ commute records...
          </p>
        </div>
      )}

      {response && !loading && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main AI Response Box */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Grounded Intelligence Synthesis</h3>
                  <span className="text-[10px] text-slate-400">
                    Method: {response.method} • Source: {response.dataSource}
                  </span>
                </div>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
                {response.reviewCount} Reviews Processed
              </span>
            </div>

            {/* Markdown-style answer body */}
            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal space-y-2">
              {response.answer}
            </div>
          </div>

          {/* Evidence Citations & Sample Excerpts */}
          {response.relevantReviews && response.relevantReviews.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Direct Review Evidence & Citations</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  {response.relevantReviews.length} Supporting Records
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.relevantReviews.map((rev) => (
                  <div
                    key={rev.reviewId}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400">⭐ {rev.rating}</span>
                      <Badge variant="category" label={rev.category.replace(/_/g, ' ')} size="sm" />
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{rev.excerpt}..."
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 block pt-1">
                      Ref: {rev.reviewId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
