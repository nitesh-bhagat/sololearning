import React from 'react';

export interface MCQBlockProps {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  onChange?: (data: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }) => void;
  readOnly?: boolean;
}

export function MCQBlock({
  question,
  options,
  answer,
  explanation,
  onChange,
  readOnly = false,
}: MCQBlockProps) {
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
        {explanation && (
          <div className="mt-2 p-3 bg-blue-500/10 text-blue-500 rounded-xl text-sm border border-blue-500/20">
            <strong>Explanation:</strong> {explanation}
          </div>
        )}
      </div>
    );
  }

  const updateField = (field: string, value: any) => {
    onChange?.({ question, options, answer, explanation, [field]: value });
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
    onChange?.({ question, options: newOptions, answer: newAnswer, explanation });
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
        <label className="text-xs font-bold text-text-light">Explanation (Optional)</label>
        <textarea
          value={explanation}
          onChange={(e) => updateField('explanation', e.target.value)}
          placeholder="Explain why the answer is correct..."
          rows={2}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm"
        />
      </div>
    </div>
  );
}
