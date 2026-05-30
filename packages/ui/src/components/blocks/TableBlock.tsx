import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface TableBlockProps {
  headers: string[];
  rows: string[][];
  onChange?: (data: { headers: string[]; rows: string[][] }) => void;
  readOnly?: boolean;
}

export function TableBlock({
  headers = [],
  rows = [],
  onChange,
  readOnly = false,
}: TableBlockProps) {
  if (readOnly) {
    return (
      <div className="w-full overflow-x-auto my-4 rounded-xl border border-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-border">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 text-sm font-bold text-text">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, rIndex) => (
              <tr key={rIndex} className="bg-background">
                {row.map((cell, cIndex) => (
                  <td key={cIndex} className="px-4 py-3 text-sm text-text-light">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const updateHeader = (index: number, val: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = val;
    onChange?.({ headers: newHeaders, rows });
  };

  const updateCell = (rIndex: number, cIndex: number, val: string) => {
    const newRows = [...rows];
    newRows[rIndex] = [...newRows[rIndex]];
    newRows[rIndex][cIndex] = val;
    onChange?.({ headers, rows: newRows });
  };

  const addColumn = () => {
    const newHeaders = [...headers, `Column ${headers.length + 1}`];
    const newRows = rows.map((r) => [...r, '']);
    onChange?.({ headers: newHeaders, rows: newRows });
  };

  const addRow = () => {
    const newRows = [...rows, new Array(headers.length).fill('')];
    onChange?.({ headers, rows: newRows });
  };

  const removeColumn = (index: number) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, i) => i !== index);
    const newRows = rows.map((r) => r.filter((_, i) => i !== index));
    onChange?.({ headers: newHeaders, rows: newRows });
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, i) => i !== index);
    onChange?.({ headers, rows: newRows });
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border overflow-x-auto">
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-text-light uppercase tracking-wider">
          Table Block
        </span>
        <div className="flex gap-2">
          <button
            onClick={addColumn}
            className="text-xs font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded"
          >
            + Col
          </button>
          <button
            onClick={addRow}
            className="text-xs font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded"
          >
            + Row
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-background border-b border-border">
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 border-r border-border relative group">
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => updateHeader(i, e.target.value)}
                    className="w-full bg-transparent border-none text-sm font-bold text-text focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                  />
                  {headers.length > 1 && (
                    <button
                      onClick={() => removeColumn(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs shadow-md"
                    >
                      ✕
                    </button>
                  )}
                </th>
              ))}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, rIndex) => (
              <tr key={rIndex} className="bg-background group">
                {row.map((cell, cIndex) => (
                  <td key={cIndex} className="px-3 py-2 border-r border-border">
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rIndex, cIndex, e.target.value)}
                      className="w-full bg-transparent border-none text-sm text-text-light focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                      placeholder="..."
                    />
                  </td>
                ))}
                <td className="px-2 text-center">
                  <button
                    onClick={() => removeRow(rIndex)}
                    disabled={rows.length <= 1}
                    className="p-1 text-text-light hover:text-red-500 rounded opacity-0 group-hover:opacity-100 disabled:opacity-30 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
