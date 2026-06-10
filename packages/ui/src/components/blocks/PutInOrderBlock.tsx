'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Info } from 'lucide-react';

export interface PutInOrderBlockProps {
  items: string[];
  explanation?: string;
  explanationSnippet?: string;
  explanationTip?: string;
  onChange?: (data: {
    items: string[];
    explanation?: string;
    explanationSnippet?: string;
    explanationTip?: string;
  }) => void;
  readOnly?: boolean;
  isInteractive?: boolean;
  validationState?: 'idle' | 'correct' | 'wrong';
  onAnswerReady?: (isComplete: boolean, isCorrect: boolean) => void;
  onShowExplanation?: () => void;
}

const SHAKE_CSS = `
@keyframes shake-block {
  0%, 100% { transform: translateX(0) scale(1.05); }
  25% { transform: translateX(-5px) scale(1.05); }
  75% { transform: translateX(5px) scale(1.05); }
}
`;

export function PutInOrderBlock({
  items = [],
  explanation = '',
  explanationSnippet = '',
  explanationTip = '',
  onChange,
  readOnly = false,
  isInteractive = false,
  validationState = 'idle',
  onAnswerReady,
  onShowExplanation,
}: PutInOrderBlockProps) {
  // Interactive Mode State
  const [orderedItems, setOrderedItems] = useState<string[]>(Array(items.length).fill(''));
  const [availableItems, setAvailableItems] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    if (isInteractive) {
      const initItems = items.map((item, i) => ({ id: `item-${i}`, text: item }));
      // Shuffle available items
      for (let i = initItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [initItems[i], initItems[j]] = [initItems[j], initItems[i]];
      }
      setAvailableItems(initItems);
      setOrderedItems(Array(items.length).fill(''));
    }
  }, [isInteractive, items]);

  useEffect(() => {
    if (isInteractive && onAnswerReady) {
      const isComplete = orderedItems.every((item) => item !== '');
      const isCorrect = isComplete && orderedItems.every((item, i) => item === items[i]);
      onAnswerReady(isComplete, isCorrect);
    }
  }, [orderedItems, isInteractive, items]);

  const handleAvailableClick = (itemObj: { id: string; text: string }) => {
    if (validationState !== 'idle') return;
    const firstEmptyIndex = orderedItems.findIndex((i) => i === '');
    if (firstEmptyIndex !== -1) {
      const newOrdered = [...orderedItems];
      newOrdered[firstEmptyIndex] = itemObj.text;
      setOrderedItems(newOrdered);
      setAvailableItems((prev) => prev.filter((i) => i.id !== itemObj.id));
    }
  };

  const handleSlotClick = (index: number) => {
    if (validationState !== 'idle') return;
    const text = orderedItems[index];
    if (text) {
      const newOrdered = [...orderedItems];
      newOrdered[index] = '';
      setOrderedItems(newOrdered);
      setAvailableItems((prev) => [...prev, { id: `returned-${Date.now()}`, text }]);
    }
  };

  if (isInteractive) {
    let containerClass =
      'flex flex-col gap-6 w-full p-8 rounded-3xl border-2 transition-all duration-300 transform ';
    let style = {};

    if (validationState === 'idle') {
      containerClass += 'bg-surface border-border';
    } else if (validationState === 'correct') {
      containerClass +=
        'bg-green-500/20 border-green-500 scale-[1.05] shadow-[0_0_20px_rgba(34,197,94,0.3)] z-10';
    } else if (validationState === 'wrong') {
      containerClass += 'bg-red-500/20 border-red-500 z-10';
      style = { animation: 'shake-block 0.5s ease-in-out' };
    }

    return (
      <div className={containerClass} style={style}>
        <style>{SHAKE_CSS}</style>
        <h4 className="text-xl font-bold text-text tracking-tight mb-4">
          Put the following in correct order:
        </h4>

        <div className="flex flex-col gap-3">
          {orderedItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSlotClick(idx)}
              className={`flex items-center gap-4 p-4 rounded-xl font-medium cursor-pointer transition-colors ${
                item
                  ? validationState === 'correct'
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                    : validationState === 'wrong'
                      ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                      : 'bg-primary/10 border border-primary text-text'
                  : 'bg-white/5 border-2 border-dashed border-border text-transparent hover:bg-white/10'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${item ? (validationState === 'correct' ? 'bg-green-500/20 text-green-500' : validationState === 'wrong' ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary') : 'bg-white/10 text-white/30'}`}
              >
                {idx + 1}
              </div>
              <span className="flex-1">{item || 'Empty Slot'}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-6 p-6 bg-background rounded-2xl border border-border min-h-[120px]">
          {availableItems.length > 0 ? (
            availableItems.map((itemObj) => (
              <button
                key={itemObj.id}
                onClick={() => handleAvailableClick(itemObj)}
                className="w-full text-left px-5 py-4 bg-surface border border-border hover:border-primary rounded-xl font-medium text-sm transition-all shadow-sm"
              >
                {itemObj.text}
              </button>
            ))
          ) : (
            <div className="w-full text-center text-text-light text-sm flex items-center justify-center italic">
              All items placed. Click an item in the list to return it.
            </div>
          )}
        </div>

        {validationState !== 'idle' && (
          <div className="flex justify-center mt-2">
            <button
              onClick={onShowExplanation}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-500/10 text-blue-400 font-bold hover:bg-blue-500/20 transition-colors"
            >
              <Info size={18} /> See Explanation
            </button>
          </div>
        )}
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="flex flex-col gap-2 w-full my-4">
        <h4 className="text-sm font-bold text-text-light mb-2">
          Put the following in correct order:
        </h4>
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl cursor-grab hover:border-primary transition-colors"
          >
            <GripVertical size={16} className="text-text-light" />
            <span className="text-sm font-medium text-text">{item}</span>
          </div>
        ))}
        {(explanation || explanationTip || explanationSnippet) && (
          <div className="mt-4 p-3 bg-blue-500/10 text-blue-500 rounded-xl text-sm border border-blue-500/20 flex flex-col gap-2">
            {explanation && (
              <div>
                <strong>Explanation:</strong> {explanation}
              </div>
            )}
            {explanationSnippet && (
              <pre className="p-2 bg-black/30 rounded text-xs overflow-x-auto">
                <code>{explanationSnippet}</code>
              </pre>
            )}
            {explanationTip && (
              <div>
                <strong>Tip:</strong> {explanationTip}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange?.({ items: newItems, explanation, explanationSnippet, explanationTip });
  };

  const addItem = () => {
    onChange?.({ items: [...items, ''], explanation, explanationSnippet, explanationTip });
  };

  const removeItem = (index: number) => {
    onChange?.({
      items: items.filter((_, i) => i !== index),
      explanation,
      explanationSnippet,
      explanationTip,
    });
  };

  const updateExplanationField = (field: string, value: string) => {
    onChange?.({ items, explanation, explanationSnippet, explanationTip, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-text-light uppercase tracking-wider">
          Put in Order Exercise
        </span>
      </div>
      <div className="text-xs text-text-light px-1 mb-2">
        List the items in their correct sequential order below.
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {idx + 1}
            </div>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder="Sequential item..."
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors text-sm"
            />
            <button
              onClick={() => removeItem(idx)}
              disabled={items.length <= 2}
              className="p-2 text-text-light hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="self-start mt-2 px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-lg transition-all"
        >
          <Plus size={14} /> Add Item
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
        <label className="text-xs font-bold text-text-light">Explanation Text (Optional)</label>
        <textarea
          value={explanation}
          onChange={(e) => updateExplanationField('explanation', e.target.value)}
          placeholder="Explain the correct order..."
          rows={2}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm"
        />
        <label className="text-xs font-bold text-text-light mt-1">Code Snippet (Optional)</label>
        <textarea
          value={explanationSnippet || ''}
          onChange={(e) => updateExplanationField('explanationSnippet', e.target.value)}
          placeholder="Provide a relevant code snippet if needed..."
          rows={3}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm font-mono"
        />
        <label className="text-xs font-bold text-text-light mt-1">Extra Tip (Optional)</label>
        <input
          type="text"
          value={explanationTip || ''}
          onChange={(e) => updateExplanationField('explanationTip', e.target.value)}
          placeholder="A quick tip or rule of thumb..."
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors text-sm"
        />
      </div>
    </div>
  );
}
