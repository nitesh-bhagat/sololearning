import React from 'react';
import { Bot } from 'lucide-react';

export interface AIShortQuestionBlockProps {
  question: string;
  gradingCriteria: string;
  onChange?: (data: { question: string; gradingCriteria: string }) => void;
  readOnly?: boolean;
}

export function AIShortQuestionBlock({
  question,
  gradingCriteria,
  onChange,
  readOnly = false,
}: AIShortQuestionBlockProps) {
  if (readOnly) {
    return (
      <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border">
        <h3 className="text-lg font-bold text-text">{question || 'Empty Question'}</h3>
        <textarea
          placeholder="Write your answer here..."
          rows={4}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm leading-relaxed"
        />
        <button className="self-end px-4 py-2 bg-primary text-background font-bold rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Bot size={18} />
          Analyze with AI
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full bg-surface/50 p-6 rounded-2xl border border-emerald-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <Bot size={48} className="text-emerald-500/10" />
      </div>

      <div className="flex items-center gap-2 px-1 relative z-10">
        <Bot size={16} className="text-emerald-500" />
        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
          AI Graded Short Question
        </span>
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        <label className="text-xs font-bold text-text-light">Question Prompt</label>
        <textarea
          value={question}
          onChange={(e) => onChange?.({ question: e.target.value, gradingCriteria })}
          placeholder="Ask a question that requires a short paragraph answer..."
          rows={2}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text placeholder-text-light/50 focus:outline-none focus:border-emerald-500 transition-colors resize-y text-sm leading-relaxed"
        />
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        <label className="text-xs font-bold text-emerald-500">AI Grading Criteria (Prompt)</label>
        <textarea
          value={gradingCriteria}
          onChange={(e) => onChange?.({ question, gradingCriteria: e.target.value })}
          placeholder="Tell the AI what makes a good answer (e.g., 'Student must mention X and explain Y')..."
          rows={3}
          className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 text-text placeholder-emerald-500/50 focus:outline-none focus:border-emerald-500 transition-colors resize-y text-sm leading-relaxed"
        />
      </div>
    </div>
  );
}
