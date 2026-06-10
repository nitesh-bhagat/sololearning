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

import { useDraggable } from '@dnd-kit/core';

interface WidgetListProps {
  onWidgetSelect?: (widgetId: string) => void;
  activeTab?: 'content' | 'exercise' | 'excercise';
}

const DraggableWidget = ({ widget, onWidgetSelect, isExercise }: any) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${widget.id}`,
    data: {
      type: 'widget',
      widgetId: widget.id,
    },
  });

  const Icon = widget.icon;
  const opacity = isDragging ? 'opacity-40 shadow-xl scale-105 z-50' : 'opacity-100';

  if (isExercise) {
    return (
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={() => onWidgetSelect?.(widget.id)}
        className={`flex flex-col items-center justify-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-primary/10 hover:border-primary/20 transition-all text-center group cursor-grab active:cursor-grabbing ${opacity}`}
      >
        <Icon
          size={24}
          className="text-emerald-500 group-hover:scale-110 transition-transform duration-200 pointer-events-none"
        />
        <span className="text-[0.7rem] font-medium text-text leading-tight pointer-events-none">
          {widget.label}
        </span>
      </button>
    );
  }

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onWidgetSelect?.(widget.id)}
      className={`flex flex-col items-center justify-center gap-2 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/10 transition-all text-center cursor-grab active:cursor-grabbing ${opacity}`}
    >
      <Icon size={24} className="text-primary pointer-events-none" />
      <span className="text-[0.7rem] font-medium text-text leading-tight pointer-events-none">
        {widget.label}
      </span>
    </button>
  );
};

export function WidgetList({ onWidgetSelect, activeTab }: WidgetListProps) {
  const showContent = !activeTab || activeTab === 'content';
  const showExercise = !activeTab || activeTab === 'exercise' || activeTab === 'excercise';

  const headerTitle = showExercise ? 'Edit Excersize' : 'Edit content';

  return (
    <div className="w-80 h-full bg-surface border-r border-border overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-border sticky top-0 bg-surface z-10">
        <h2 className="text-lg font-bold text-text capitalize">{headerTitle}</h2>
        <p className="text-xs text-text-light mt-1">Drag or click to add blocks</p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto pb-20">
        {/* Content Blocks Section */}
        {showContent && (
          <div className="mb-8">
            <div className="text-xs font-bold text-text-light uppercase tracking-wider mb-3 px-1">
              Content Blocks
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_WIDGETS.map((widget) => (
                <DraggableWidget key={widget.id} widget={widget} onWidgetSelect={onWidgetSelect} />
              ))}
            </div>
          </div>
        )}

        {/* Exercise Blocks Section */}
        {showExercise && (
          <div>
            <div className="text-xs font-bold text-text-light uppercase tracking-wider mb-3 px-1">
              Exercise Blocks
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXERCISE_WIDGETS.map((widget) => (
                <DraggableWidget
                  key={widget.id}
                  widget={widget}
                  onWidgetSelect={onWidgetSelect}
                  isExercise
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
