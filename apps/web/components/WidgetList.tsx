'use client';
import React from 'react';
import {
  AlignLeft,
  Image as ImageIcon,
  Info,
  AlertTriangle,
  AlertCircle,
  List,
  Code,
  BarChart,
  Minus,
  Table,
  StickyNote,
  CheckSquare,
  Link,
  ListOrdered,
  Type,
  Bot,
} from 'lucide-react';

const CONTENT_WIDGETS = [
  { id: 'text', label: 'Text Block', icon: AlignLeft },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'info-card', label: 'Info Text Card', icon: Info },
  { id: 'warning-card', label: 'Warning Text Card', icon: AlertTriangle },
  { id: 'error-card', label: 'Error Text Card', icon: AlertCircle },
  { id: 'bullets', label: 'Bullets / List points', icon: List },
  { id: 'code-block', label: 'Code Block', icon: Code },
  { id: 'graphs', label: 'Graphs', icon: BarChart },
  { id: 'divide', label: 'Divide', icon: Minus },
  { id: 'table', label: 'Table', icon: Table },
  { id: 'notes', label: 'Notes', icon: StickyNote },
];

const EXERCISE_WIDGETS = [
  { id: 'mcq', label: 'MCQ', icon: CheckSquare },
  { id: 'match-pair', label: 'Match Pair', icon: Link },
  { id: 'put-in-order', label: 'Put in Order', icon: ListOrdered },
  { id: 'fill-blanks', label: 'Fill in the Blanks', icon: Type },
  { id: 'ai-short-question', label: 'Short Question (AI)', icon: Bot },
];

interface WidgetListProps {
  onWidgetSelect?: (widgetId: string) => void;
}

export function WidgetList({ onWidgetSelect }: WidgetListProps) {
  return (
    <div className="w-80 h-full bg-surface border-r border-border overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-border sticky top-0 bg-surface z-10">
        <h2 className="text-lg font-bold text-text">Widgets List</h2>
        <p className="text-xs text-text-light mt-1">Drag or click to add blocks</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto pb-20">
        {/* Content Blocks Section */}
        <div className="mb-8">
          <div className="text-xs font-bold text-text-light uppercase tracking-wider mb-3 px-1">
            Content Blocks
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CONTENT_WIDGETS.map((widget) => {
              const Icon = widget.icon;
              return (
                <button
                  key={widget.id}
                  onClick={() => onWidgetSelect?.(widget.id)}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-colors text-center"
                >
                  <Icon size={24} className="text-primary" />
                  <span className="text-[0.7rem] font-medium text-text leading-tight">
                    {widget.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercise Blocks Section */}
        <div>
          <div className="text-xs font-bold text-text-light uppercase tracking-wider mb-3 px-1">
            Exercise Blocks
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EXERCISE_WIDGETS.map((widget) => {
              const Icon = widget.icon;
              return (
                <button
                  key={widget.id}
                  onClick={() => onWidgetSelect?.(widget.id)}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-colors text-center group"
                >
                  <Icon
                    size={24}
                    className="text-emerald-500 group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="text-[0.7rem] font-medium text-text leading-tight">
                    {widget.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
