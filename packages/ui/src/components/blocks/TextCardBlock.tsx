import React from 'react';
import { Info, AlertTriangle, AlertCircle } from 'lucide-react';

export interface TextCardBlockProps {
  type: 'info' | 'warning' | 'error';
  content: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

export function TextCardBlock({ type, content, onChange, readOnly = false }: TextCardBlockProps) {
  const styles = {
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
      icon: <Info size={20} className="mt-0.5 shrink-0 text-blue-500" />,
      label: 'Info Card',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-500',
      icon: <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-500" />,
      label: 'Warning Card',
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-500',
      icon: <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />,
      label: 'Error Card',
    },
  };

  const currentStyle = styles[type];

  if (readOnly) {
    return (
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border ${currentStyle.bg} ${currentStyle.border}`}
      >
        {currentStyle.icon}
        <div className="flex-1 text-text leading-relaxed text-sm">
          {content || <span className="opacity-50 italic">Empty {type} card</span>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-2 w-full p-5 rounded-2xl border ${currentStyle.bg} ${currentStyle.border}`}
    >
      <div className="flex items-center gap-2 px-1">
        {currentStyle.icon}
        <span className={`text-xs font-bold uppercase tracking-wider ${currentStyle.text}`}>
          {currentStyle.label}
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={`Type ${type} message here...`}
        rows={2}
        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors resize-y text-sm leading-relaxed"
      />
    </div>
  );
}

export const InfoCardBlock = (props: any) => {
  const { type, ...rest } = props;
  return <TextCardBlock {...rest} type="info" />;
};
export const WarningCardBlock = (props: any) => {
  const { type, ...rest } = props;
  return <TextCardBlock {...rest} type="warning" />;
};
export const ErrorCardBlock = (props: any) => {
  const { type, ...rest } = props;
  return <TextCardBlock {...rest} type="error" />;
};
