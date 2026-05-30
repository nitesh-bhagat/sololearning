import React from 'react';
import { BarChart3 } from 'lucide-react';

export interface GraphsBlockProps {
  data: string; // Storing as JSON string for now to keep it generic
  title: string;
  onChange?: (data: { title: string; data: string }) => void;
  readOnly?: boolean;
}

export function GraphsBlock({ data, title, onChange, readOnly = false }: GraphsBlockProps) {
  if (readOnly) {
    return (
      <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border my-4 items-center justify-center min-h-[250px]">
        {title && <h4 className="text-sm font-bold text-text mb-2">{title}</h4>}
        <div className="flex-1 flex flex-col items-center justify-center text-text-light opacity-50 gap-2">
          <BarChart3 size={48} />
          <span className="text-sm font-bold tracking-wider uppercase">
            Graph Render Placeholder
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-text-light uppercase tracking-wider">
          Graphs Block
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-text-light">Graph Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange?.({ title: e.target.value, data })}
          placeholder="e.g., Monthly Revenue"
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors text-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-text-light">Graph Data (JSON format)</label>
        <textarea
          value={data}
          onChange={(e) => onChange?.({ title, data: e.target.value })}
          placeholder='{"labels": ["Jan", "Feb"], "values": [10, 20]}'
          rows={4}
          className="w-full bg-background font-mono border border-border rounded-xl px-4 py-3 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm leading-relaxed"
        />
      </div>
    </div>
  );
}
