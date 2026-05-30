import React from 'react';

export function DivideBlock() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-6">
      <div className="w-full h-[1px] bg-border relative flex items-center justify-center">
        <div className="absolute bg-background px-4 text-text-light/50 text-xs font-bold uppercase tracking-widest">
          Divider
        </div>
      </div>
    </div>
  );
}
