import React from 'react';
import { StickyNote } from 'lucide-react';

export interface NotesBlockProps {
  content: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

export function NotesBlock({ content, onChange, readOnly = false }: NotesBlockProps) {
  if (readOnly) {
    return (
      <div className="flex flex-col gap-2 w-full my-4 bg-purple-500/10 border border-purple-500/30 p-5 rounded-tr-3xl rounded-bl-3xl rounded-tl-sm rounded-br-sm shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-transparent via-transparent to-purple-500/20 rounded-bl-xl border-l border-b border-purple-500/20"></div>
        <div className="flex items-start gap-3">
          <StickyNote size={20} className="mt-0.5 shrink-0 text-purple-600 opacity-50" />
          <div className="flex-1 text-purple-800 dark:text-purple-200 leading-relaxed text-sm whitespace-pre-wrap font-medium">
            {content || <span className="opacity-50 italic">Empty note</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full p-5 rounded-2xl border bg-purple-500/5 border-purple-500/20">
      <div className="flex items-center gap-2 px-1">
        <StickyNote size={18} className="text-purple-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
          Notes Block
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Type a note here..."
        rows={3}
        className="w-full bg-purple-500/5 border border-purple-500/20 rounded-xl px-4 py-3 text-purple-900 dark:text-purple-100 placeholder-purple-600/50 focus:outline-none focus:border-purple-500/50 transition-colors resize-y text-sm leading-relaxed"
      />
    </div>
  );
}
