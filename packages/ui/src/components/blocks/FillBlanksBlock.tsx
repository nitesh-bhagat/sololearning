'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Info } from 'lucide-react';

export interface FillBlanksBlockProps {
  question: string;
  blankAnswers: string[];
  explanation: string;
  explanationSnippet?: string;
  explanationTip?: string;
  onChange?: (data: {
    question: string;
    blankAnswers: string[];
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

export function FillBlanksBlock({
  question,
  blankAnswers = [],
  explanation,
  explanationSnippet = '',
  explanationTip = '',
  onChange,
  readOnly = false,
  isInteractive = false,
  validationState = 'idle',
  onAnswerReady,
  onShowExplanation,
}: FillBlanksBlockProps) {
  const parts = question.split('______');

  // Interactive Mode State
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(parts.length - 1).fill(''));
  const [availableWords, setAvailableWords] = useState<{ id: string; word: string }[]>([]);

  useEffect(() => {
    if (isInteractive) {
      const words = blankAnswers.map((w, i) => ({ id: `word-${i}`, word: w }));
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
      setAvailableWords(words);
      setUserAnswers(Array(parts.length - 1).fill(''));
    }
  }, [isInteractive, blankAnswers, parts.length]);

  useEffect(() => {
    if (isInteractive && onAnswerReady) {
      const isComplete = userAnswers.every((ans) => ans !== '');
      const isCorrect = userAnswers.every((ans, i) => ans === blankAnswers[i]);
      onAnswerReady(isComplete, isCorrect);
    }
  }, [userAnswers, isInteractive, blankAnswers]);

  const handleWordSelect = (wordObj: { id: string; word: string }) => {
    if (validationState !== 'idle') return;
    const firstEmptyIndex = userAnswers.findIndex((ans) => ans === '');
    if (firstEmptyIndex !== -1) {
      const newAnswers = [...userAnswers];
      newAnswers[firstEmptyIndex] = wordObj.word;
      setUserAnswers(newAnswers);
      setAvailableWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    }
  };

  const handleBlankClick = (index: number) => {
    if (validationState !== 'idle') return;
    const word = userAnswers[index];
    if (word) {
      const newAnswers = [...userAnswers];
      newAnswers[index] = '';
      setUserAnswers(newAnswers);
      setAvailableWords((prev) => [...prev, { id: `returned-${Date.now()}`, word }]);
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
        <h3 className="text-xl font-bold text-text leading-loose tracking-tight">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < parts.length - 1 && (
                <span
                  onClick={() => handleBlankClick(i)}
                  className={`inline-flex items-center justify-center min-w-[100px] h-10 px-4 mx-2 rounded-xl font-bold cursor-pointer transition-colors ${
                    userAnswers[i]
                      ? validationState === 'correct'
                        ? 'bg-green-500 text-black'
                        : validationState === 'wrong'
                          ? 'bg-red-500 text-white'
                          : 'bg-primary text-black hover:bg-primary/80'
                      : 'bg-white/5 border-2 border-dashed border-border text-transparent hover:bg-white/10'
                  }`}
                >
                  {userAnswers[i] || '?'}
                </span>
              )}
            </React.Fragment>
          ))}
        </h3>

        <div className="flex flex-wrap gap-3 mt-4 p-6 bg-background rounded-2xl border border-border min-h-[100px]">
          {availableWords.length > 0 ? (
            availableWords.map((wordObj) => (
              <button
                key={wordObj.id}
                onClick={() => handleWordSelect(wordObj)}
                className="px-5 py-2.5 bg-surface border border-border hover:border-primary hover:text-primary rounded-xl font-bold text-sm transition-all hover:-translate-y-1 shadow-sm"
              >
                {wordObj.word}
              </button>
            ))
          ) : (
            <div className="w-full text-center text-text-light text-sm flex items-center justify-center italic">
              All words placed. Click a blank to return a word.
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
      <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border">
        <h3 className="text-lg font-medium text-text leading-relaxed">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < parts.length - 1 && (
                <span className="inline-block px-3 py-1 mx-1 border-b-2 border-primary text-primary font-bold">
                  {blankAnswers[i] || '?'}
                </span>
              )}
            </React.Fragment>
          ))}
        </h3>
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
      blankAnswers,
      explanation,
      explanationSnippet,
      explanationTip,
      [field]: value,
    });
  };

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...blankAnswers];
    newAnswers[index] = value;
    updateField('blankAnswers', newAnswers);
  };

  const addBlank = () => {
    updateField('question', question + ' ______ ');
    updateField('blankAnswers', [...blankAnswers, '']);
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-text-light uppercase tracking-wider">
          Fill in the Blanks
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-text-light">
          Sentence with Blanks (Use ______ for blanks)
        </label>
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => updateField('question', e.target.value)}
            placeholder="The ______ function is used to collect information."
            rows={2}
            className="w-full bg-background border border-border rounded-xl px-4 py-2 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm leading-relaxed"
          />
          <button
            onClick={addBlank}
            className="absolute right-2 bottom-2 px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary/20 transition-colors"
          >
            + Insert Blank
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-xs font-bold text-text-light">Answers</label>
        {blankAnswers.map((ans, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs font-bold w-16 text-text-light">Blank {idx + 1}</span>
            <input
              type="text"
              value={ans}
              onChange={(e) => updateAnswer(idx, e.target.value)}
              placeholder="Correct answer"
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
        ))}
        {blankAnswers.length === 0 && (
          <div className="text-xs text-text-light italic">
            Add '______' to the sentence to create blanks.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-xs font-bold text-text-light">Explanation Text (Optional)</label>
        <textarea
          value={explanation}
          onChange={(e) => updateField('explanation', e.target.value)}
          placeholder="Explain the correct answers..."
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
