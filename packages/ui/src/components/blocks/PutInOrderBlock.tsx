import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface PutInOrderBlockProps {
  items: string[];
  onChange?: (items: string[]) => void;
  readOnly?: boolean;
}

export function PutInOrderBlock({ items = [], onChange, readOnly = false }: PutInOrderBlockProps) {
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
      </div>
    );
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange?.(newItems);
  };

  const addItem = () => {
    onChange?.([...items, '']);
  };

  const removeItem = (index: number) => {
    onChange?.(items.filter((_, i) => i !== index));
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
    </div>
  );
}
