import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface BulletsBlockProps {
  items: string[];
  onChange?: (items: string[]) => void;
  readOnly?: boolean;
}

export function BulletsBlock({ items, onChange, readOnly = false }: BulletsBlockProps) {
  if (readOnly) {
    return (
      <ul className="list-disc pl-6 my-4 flex flex-col gap-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-text leading-relaxed text-base">
            {item}
          </li>
        ))}
      </ul>
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
          Bullet List
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 group">
            <div className="mt-2.5 text-text-light/50 cursor-grab hover:text-text transition-colors">
              <GripVertical size={16} />
            </div>
            <div className="mt-3.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
            <textarea
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              placeholder={`List item ${idx + 1}`}
              rows={1}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm leading-relaxed"
            />
            <button
              onClick={() => removeItem(idx)}
              disabled={items.length <= 1}
              className="p-2.5 mt-0.5 text-text-light hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
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
