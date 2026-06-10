'use client';
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
];

export interface CodeBlockProps {
  code: string;
  language?: string;
  explanation: string;
  onChange?: (data: { code: string; language?: string; explanation: string }) => void;
  readOnly?: boolean;
}

export function CodeBlock({
  code,
  language = 'javascript',
  explanation,
  onChange,
  readOnly = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (readOnly) {
    return (
      <div className="flex flex-col gap-3 w-full my-4">
        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-border relative group">
          <div className="flex px-4 py-2 bg-[#2d2d2d] border-b border-[#404040] justify-between items-center">
            <div className="flex gap-1.5 items-center">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="ml-2 text-xs text-text-light font-mono">{language}</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-text-light hover:text-white transition-colors"
              title="Copy code"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="text-sm font-mono overflow-x-auto relative">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '0.875rem',
              }}
            >
              {code || '// Write some code...'}
            </SyntaxHighlighter>
          </div>
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
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-text-light">Code Snippet</label>
          <select
            value={language}
            onChange={(e) => onChange?.({ code, language: e.target.value, explanation })}
            className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-text focus:outline-none focus:border-primary"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative rounded-xl overflow-hidden border border-border focus-within:border-primary transition-colors">
          <textarea
            value={code}
            onChange={(e) => onChange?.({ code: e.target.value, language, explanation })}
            placeholder="def hello_world():&#10;    print('Hello World')"
            rows={5}
            className="w-full bg-[#1e1e1e] text-emerald-400 font-mono px-4 py-4 focus:outline-none resize-y text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-text-light">Explanation (Optional)</label>
        <textarea
          value={explanation}
          onChange={(e) => onChange?.({ code, language, explanation: e.target.value })}
          placeholder="Briefly explain what this code does..."
          rows={2}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm"
        />
      </div>
    </div>
  );
}
