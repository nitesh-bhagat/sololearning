import React from 'react';

export interface CodeBlockProps {
  code: string;
  explanation: string;
  onChange?: (data: { code: string; explanation: string }) => void;
  readOnly?: boolean;
}

export function CodeBlock({ code, explanation, onChange, readOnly = false }: CodeBlockProps) {
  if (readOnly) {
    return (
      <div className="flex flex-col gap-3 w-full my-4">
        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-border">
          <div className="flex px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
          </div>
          <pre className="p-4 text-sm font-mono text-[#d4d4d4] overflow-x-auto">
            <code>{code || '// Write some code...'}</code>
          </pre>
        </div>
        {explanation && <div className="text-sm text-text-light">{explanation}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-text-light uppercase tracking-wider">
          Code Block
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-text-light">Code Snippet</label>
        <div className="relative rounded-xl overflow-hidden border border-border focus-within:border-primary transition-colors">
          <textarea
            value={code}
            onChange={(e) => onChange?.({ code: e.target.value, explanation })}
            placeholder="def hello_world():&#10;    print('Hello World')"
            rows={5}
            className="w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono px-4 py-4 focus:outline-none resize-y text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-text-light">Explanation (Optional)</label>
        <textarea
          value={explanation}
          onChange={(e) => onChange?.({ code, explanation: e.target.value })}
          placeholder="Briefly explain what this code does..."
          rows={2}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm"
        />
      </div>
    </div>
  );
}
