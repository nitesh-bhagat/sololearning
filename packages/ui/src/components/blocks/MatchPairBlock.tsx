'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';

export interface MatchPairBlockProps {
  pairs: { left: string; right: string }[];
  explanation?: string;
  explanationSnippet?: string;
  explanationTip?: string;
  onChange?: (data: {
    pairs: { left: string; right: string }[];
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

export function MatchPairBlock({
  pairs = [],
  explanation = '',
  explanationSnippet = '',
  explanationTip = '',
  onChange,
  readOnly = false,
  isInteractive = false,
  validationState = 'idle',
  onAnswerReady,
  onShowExplanation,
}: MatchPairBlockProps) {
  // Interactive State
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [leftItems, setLeftItems] = useState<{ id: number; text: string }[]>([]);
  const [rightItems, setRightItems] = useState<{ id: number; text: string }[]>([]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);

  const [matches, setMatches] = useState<{ leftId: number; rightId: number }[]>([]);
  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number; leftId: number; rightId: number }[]
  >([]);

  useEffect(() => {
    if (isInteractive) {
      const lefts = pairs.map((p, i) => ({ id: i, text: p.left }));
      const rights = pairs.map((p, i) => ({ id: i, text: p.right }));

      // Shuffle rights
      for (let i = rights.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rights[i], rights[j]] = [rights[j], rights[i]];
      }

      setLeftItems(lefts);
      setRightItems(rights);
      setMatches([]);
    }
  }, [isInteractive, pairs]);

  useEffect(() => {
    if (isInteractive && onAnswerReady) {
      const isComplete = matches.length === pairs.length && pairs.length > 0;
      const isCorrect = isComplete && matches.every((m) => m.leftId === m.rightId);
      onAnswerReady(isComplete, isCorrect);
    }
  }, [matches, isInteractive, pairs.length]);

  const updateLines = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines = matches
      .map((match) => {
        const leftIdx = leftItems.findIndex((l) => l.id === match.leftId);
        const rightIdx = rightItems.findIndex((r) => r.id === match.rightId);
        const leftEl = leftRefs.current[leftIdx];
        const rightEl = rightRefs.current[rightIdx];

        if (leftEl && rightEl) {
          const lRect = leftEl.getBoundingClientRect();
          const rRect = rightEl.getBoundingClientRect();
          return {
            leftId: match.leftId,
            rightId: match.rightId,
            x1: lRect.right - containerRect.left,
            y1: lRect.top + lRect.height / 2 - containerRect.top,
            x2: rRect.left - containerRect.left,
            y2: rRect.top + rRect.height / 2 - containerRect.top,
          };
        }
        return null;
      })
      .filter(Boolean) as any[];
    setLines(newLines);
  };

  useEffect(() => {
    if (isInteractive) {
      updateLines();
      window.addEventListener('resize', updateLines);
      return () => window.removeEventListener('resize', updateLines);
    }
  }, [matches, isInteractive, leftItems, rightItems]);

  const handleLeftClick = (id: number) => {
    if (validationState !== 'idle') return;
    if (matches.find((m) => m.leftId === id)) return; // already matched
    setSelectedLeft(id);
    if (selectedRight !== null) {
      setMatches((prev) => [...prev, { leftId: id, rightId: selectedRight }]);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleRightClick = (id: number) => {
    if (validationState !== 'idle') return;
    if (matches.find((m) => m.rightId === id)) return;
    setSelectedRight(id);
    if (selectedLeft !== null) {
      setMatches((prev) => [...prev, { leftId: selectedLeft, rightId: id }]);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleUndo = () => {
    if (validationState !== 'idle') return;
    setMatches((prev) => prev.slice(0, -1));
  };

  if (isInteractive) {
    return (
      <div className="flex flex-col gap-6 w-full py-6 relative" ref={containerRef}>
        <div className="flex justify-between items-center">
          <h4 className="text-xl font-bold text-text tracking-tight">
            Match the following statements
          </h4>
          <button
            onClick={handleUndo}
            disabled={matches.length === 0 || validationState !== 'idle'}
            className="text-xs font-bold text-text-light hover:text-text disabled:opacity-30 uppercase tracking-wider"
          >
            Undo Last Match
          </button>
        </div>

        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 overflow-visible">
          {lines.map((line, i) => {
            const isMatchCorrect = line.leftId === line.rightId;
            let strokeColor = 'rgba(255,255,255,0.2)';
            if (validationState === 'correct')
              strokeColor = '#22c55e'; // green-500
            else if (validationState === 'wrong')
              strokeColor = isMatchCorrect ? '#22c55e' : '#ef4444'; // red-500

            return (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={strokeColor}
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        <div className="flex justify-between gap-24 relative z-20">
          <div className="flex flex-col gap-4 flex-1">
            {leftItems.map((item, i) => {
              const isMatched = matches.some((m) => m.leftId === item.id);
              const isSelected = selectedLeft === item.id;
              const match = matches.find((m) => m.leftId === item.id);
              const isCorrect = match && match.leftId === match.rightId;

              let classes =
                'p-5 bg-surface border-2 rounded-2xl text-base font-medium cursor-pointer transition-all shadow-sm ';
              if (validationState === 'idle') {
                if (isSelected) classes += 'border-primary bg-primary/10 scale-105';
                else if (isMatched) classes += 'border-white/20 bg-white/5 opacity-50';
                else classes += 'border-border hover:border-primary/50 hover:bg-white/5';
              } else {
                if (isMatched) {
                  classes += isCorrect
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-red-500 bg-red-500/10 text-red-400';
                } else {
                  classes += 'border-border opacity-30';
                }
              }

              return (
                <div
                  key={item.id}
                  ref={(el) => (leftRefs.current[i] = el)}
                  className={classes}
                  onClick={() => handleLeftClick(item.id)}
                >
                  {item.text}
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {rightItems.map((item, i) => {
              const isMatched = matches.some((m) => m.rightId === item.id);
              const isSelected = selectedRight === item.id;
              const match = matches.find((m) => m.rightId === item.id);
              const isCorrect = match && match.leftId === match.rightId;

              let classes =
                'p-5 bg-surface border-2 rounded-2xl text-base font-medium cursor-pointer transition-all shadow-sm ';
              if (validationState === 'idle') {
                if (isSelected) classes += 'border-primary bg-primary/10 scale-105';
                else if (isMatched) classes += 'border-white/20 bg-white/5 opacity-50';
                else classes += 'border-border hover:border-primary/50 hover:bg-white/5';
              } else {
                if (isMatched) {
                  classes += isCorrect
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-red-500 bg-red-500/10 text-red-400';
                } else {
                  classes += 'border-border opacity-30';
                }
              }

              return (
                <div
                  key={item.id}
                  ref={(el) => (rightRefs.current[i] = el)}
                  className={classes}
                  onClick={() => handleRightClick(item.id)}
                >
                  {item.text}
                </div>
              );
            })}
          </div>
        </div>

        {validationState !== 'idle' && (
          <div className="flex justify-center mt-6 relative z-30">
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
      <div className="flex flex-col gap-3 w-full my-4">
        <h4 className="text-sm font-bold text-text-light mb-2">Match the following:</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            {pairs.map((p, i) => (
              <div
                key={`l-${i}`}
                className="p-3 bg-surface border border-border rounded-xl text-sm text-center text-text"
              >
                {p.left}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {pairs.map((p, i) => (
              <div
                key={`r-${i}`}
                className="p-3 bg-surface border border-border rounded-xl text-sm text-center text-text cursor-pointer hover:border-primary transition-colors"
              >
                {p.right}
              </div>
            ))}
          </div>
        </div>
        {(explanation || explanationTip || explanationSnippet) && (
          <div className="mt-2 p-3 bg-blue-500/10 text-blue-500 rounded-xl text-sm border border-blue-500/20 flex flex-col gap-2">
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

  const updatePair = (index: number, side: 'left' | 'right', value: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [side]: value };
    onChange?.({ pairs: newPairs, explanation, explanationSnippet, explanationTip });
  };

  const addPair = () => {
    onChange?.({
      pairs: [...pairs, { left: '', right: '' }],
      explanation,
      explanationSnippet,
      explanationTip,
    });
  };

  const removePair = (index: number) => {
    onChange?.({
      pairs: pairs.filter((_, i) => i !== index),
      explanation,
      explanationSnippet,
      explanationTip,
    });
  };

  const updateExplanationField = (field: string, value: string) => {
    onChange?.({ pairs, explanation, explanationSnippet, explanationTip, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-text-light uppercase tracking-wider">
          Match Pair Exercise
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {pairs.map((pair, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={pair.left}
                onChange={(e) => updatePair(idx, 'left', e.target.value)}
                placeholder="Item A"
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors text-sm"
              />
              <div className="flex items-center text-text-light font-bold">→</div>
              <input
                type="text"
                value={pair.right}
                onChange={(e) => updatePair(idx, 'right', e.target.value)}
                placeholder="Matches Item A"
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
            <button
              onClick={() => removePair(idx)}
              disabled={pairs.length <= 1}
              className="p-2 text-text-light hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button
          onClick={addPair}
          className="self-start mt-2 px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-lg transition-all"
        >
          <Plus size={14} /> Add Pair
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
        <label className="text-xs font-bold text-text-light">Explanation Text (Optional)</label>
        <textarea
          value={explanation}
          onChange={(e) => updateExplanationField('explanation', e.target.value)}
          placeholder="Explain the matching logic..."
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
