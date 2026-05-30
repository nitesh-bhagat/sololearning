import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface MatchPairBlockProps {
  pairs: { left: string; right: string }[];
  onChange?: (pairs: { left: string; right: string }[]) => void;
  readOnly?: boolean;
}

export function MatchPairBlock({ pairs = [], onChange, readOnly = false }: MatchPairBlockProps) {
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
      </div>
    );
  }

  const updatePair = (index: number, side: 'left' | 'right', value: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [side]: value };
    onChange?.(newPairs);
  };

  const addPair = () => {
    onChange?.([...pairs, { left: '', right: '' }]);
  };

  const removePair = (index: number) => {
    onChange?.(pairs.filter((_, i) => i !== index));
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
    </div>
  );
}
