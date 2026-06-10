'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Info } from 'lucide-react';

export interface MCQBlockProps {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  explanationSnippet?: string;
  explanationTip?: string;
  onChange?: (data: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
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

export function MCQBlock({
  question,
  options,
  answer,
  explanation = '',
  explanationSnippet = '',
  explanationTip = '',
  onChange,
  readOnly = false,
  isInteractive = false,
  validationState = 'idle',
  onAnswerReady,
  onShowExplanation,
}: MCQBlockProps) {
  // Interactive Mode State
  const [selectedOriginalIndex, setSelectedOriginalIndex] = useState<number | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<{ text: string; originalIndex: number }[]>(
    [],
  );

  useEffect(() => {
    if (isInteractive) {
      const mapped = options.map((opt, i) => ({ text: opt, originalIndex: i }));
      // Simple shuffle
      for (let i = mapped.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mapped[i], mapped[j]] = [mapped[j], mapped[i]];
      }
      setShuffledOptions(mapped);
    }
  }, [isInteractive, options]);

  const handleOptionClick = (origIdx: number) => {
    if (validationState !== 'idle') return; // prevent changing answer after check
    setSelectedOriginalIndex(origIdx);
    onAnswerReady?.(true, origIdx === answer);
  };

  if (isInteractive) {
    return (
      <div className="flex flex-col gap-8 w-full py-4">
        <style>{SHAKE_CSS}</style>
        <h3 className="text-2xl font-bold text-text leading-relaxed tracking-tight">{question}</h3>

        <div className="grid grid-cols-2 gap-4">
          {shuffledOptions.map((opt, idx) => {
            const isSelected = selectedOriginalIndex === opt.originalIndex;
            let containerClass =
              'p-6 rounded-2xl border-2 text-lg font-medium cursor-pointer transition-all duration-300 transform ';
            let style = {};

            if (validationState === 'idle') {
              if (isSelected) {
                containerClass += 'bg-primary/10 border-primary text-text scale-[1.02] shadow-sm';
              } else {
                containerClass +=
                  'bg-surface border-border text-text hover:border-primary/50 hover:bg-white/5 hover:-translate-y-1';
              }
            } else if (validationState === 'correct') {
              if (isSelected) {
                containerClass +=
                  'bg-green-500/20 border-green-500 text-green-400 scale-[1.05] shadow-[0_0_20px_rgba(34,197,94,0.3)] z-10';
              } else {
                containerClass += 'bg-surface border-border opacity-30 text-text-light';
              }
            } else if (validationState === 'wrong') {
              if (isSelected) {
                containerClass += 'bg-red-500/20 border-red-500 text-red-400 z-10';
                style = { animation: 'shake-block 0.5s ease-in-out' };
              } else {
                containerClass += 'bg-surface border-border opacity-30 text-text-light';
              }
            }

            return (
              <div
                key={idx}
                className={containerClass}
                style={style}
                onClick={() => handleOptionClick(opt.originalIndex)}
              >
                {opt.text}
              </div>
            );
          })}
        </div>

        {validationState !== 'idle' && (
          <div className="flex justify-center mt-4">
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
      <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border">
        <h3 className="text-lg font-bold text-text">{question || 'Empty Question'}</h3>
        <div className="flex flex-col gap-2">
          {options.map((opt, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${
                idx === answer
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                  : 'bg-background border-border text-text'
              }`}
            >
              {opt || `Option ${idx + 1}`}
              {idx === answer && <span className="ml-2 font-bold text-xs">(Correct Answer)</span>}
            </div>
          ))}
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

  const updateField = (field: string, value: any) => {
    onChange?.({
      question,
      options,
      answer,
      explanation,
      explanationSnippet,
      explanationTip,
      [field]: value,
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    updateField('options', newOptions);
  };

  const addOption = () => {
    updateField('options', [...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    let newAnswer = answer;
    if (answer === index) newAnswer = 0;
    else if (answer > index) newAnswer = answer - 1;
    onChange?.({
      question,
      options: newOptions,
      answer: newAnswer,
      explanation,
      explanationSnippet,
      explanationTip,
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-surface/50 p-6 rounded-2xl border border-border">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-text-light uppercase tracking-wider">
          Multiple Choice Question
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-text-light">Question Text</label>
        <input
          type="text"
          value={question}
          onChange={(e) => updateField('question', e.target.value)}
          placeholder="Enter question here..."
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors font-medium"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-text-light">Options</label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="radio"
              name={`mcq-answer-${question.substring(0, 5)}`}
              checked={answer === idx}
              onChange={() => updateField('answer', idx)}
              className="w-4 h-4 cursor-pointer accent-emerald-500"
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => updateOption(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              className={`flex-1 bg-background border rounded-xl px-4 py-2 text-sm placeholder-text-light/50 focus:outline-none transition-colors ${
                answer === idx
                  ? 'border-emerald-500/50 text-emerald-500 font-medium'
                  : 'border-border text-text focus:border-primary'
              }`}
            />
            <button
              onClick={() => removeOption(idx)}
              disabled={options.length <= 2}
              className="p-2 text-text-light hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addOption}
          className="self-start mt-2 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-lg transition-all"
        >
          + Add Option
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-xs font-bold text-text-light">Explanation Text (Optional)</label>
        <textarea
          value={explanation}
          onChange={(e) => updateField('explanation', e.target.value)}
          placeholder="Explain why the answer is correct..."
          rows={2}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm"
        />
        <label className="text-xs font-bold text-text-light mt-1">Code Snippet (Optional)</label>
        <textarea
          value={explanationSnippet || ''}
          onChange={(e) => updateField('explanationSnippet', e.target.value)}
          placeholder="Provide a relevant code snippet if needed..."
          rows={3}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm font-mono"
        />
        <label className="text-xs font-bold text-text-light mt-1">Extra Tip (Optional)</label>
        <input
          type="text"
          value={explanationTip || ''}
          onChange={(e) => updateField('explanationTip', e.target.value)}
          placeholder="A quick tip or rule of thumb..."
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors text-sm"
        />
      </div>
    </div>
  );
}
