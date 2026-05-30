import React from 'react';

export interface FillBlanksBlockProps {
  question: string;
  blankAnswers: string[];
  explanation: string;
  onChange?: (data: { question: string; blankAnswers: string[]; explanation: string }) => void;
  readOnly?: boolean;
}

export function FillBlanksBlock({
  question,
  blankAnswers = [],
  explanation,
  onChange,
  readOnly = false,
}: FillBlanksBlockProps) {
  if (readOnly) {
    const parts = question.split('______');
    return (
      <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border">
        <h3 className="text-lg font-medium text-text leading-relaxed">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < parts.length - 1 && (
                <input
                  type="text"
                  className="w-24 border-b-2 border-text bg-transparent outline-none text-center px-2 text-primary font-bold inline-block mx-1"
                  placeholder="?"
                />
              )}
            </React.Fragment>
          ))}
        </h3>
        {explanation && (
          <div className="mt-2 p-3 bg-blue-500/10 text-blue-500 rounded-xl text-sm border border-blue-500/20">
            <strong>Explanation:</strong> {explanation}
          </div>
        )}
      </div>
    );
  }

  const updateField = (field: string, value: any) => {
    onChange?.({ question, blankAnswers, explanation, [field]: value });
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
        <label className="text-xs font-bold text-text-light">Explanation (Optional)</label>
        <textarea
          value={explanation}
          onChange={(e) => updateField('explanation', e.target.value)}
          placeholder="Explain the correct answers..."
          rows={2}
          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm"
        />
      </div>
    </div>
  );
}
