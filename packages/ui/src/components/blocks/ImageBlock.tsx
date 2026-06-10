import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

export interface ImageBlockProps {
  url: string;
  caption: string;
  onChange?: (data: { url: string; caption: string }) => void;
  readOnly?: boolean;
}

export function ImageBlock({ url, caption, onChange, readOnly = false }: ImageBlockProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onChange?.({ url: dataUrl, caption });
      };
      reader.readAsDataURL(file);
    }
  };
  if (readOnly) {
    return (
      <div className="flex flex-col items-center gap-2 w-full my-4">
        {url ? (
          <img
            src={url}
            alt={caption}
            className="max-w-full rounded-2xl border border-border shadow-sm max-h-[400px] object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-surface border border-dashed border-border rounded-2xl flex items-center justify-center text-text-light">
            <ImageIcon size={48} className="opacity-20" />
          </div>
        )}
        {caption && <span className="text-xs text-text-light italic">{caption}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full bg-surface p-6 rounded-2xl border border-border">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-text-light uppercase tracking-wider">
          Image Block
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {url && (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border bg-background mb-2 group">
            <img src={url} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-white text-sm font-bold">Image Preview</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-text-light">Image Source</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={url.startsWith('data:') ? 'Uploaded Image' : url}
              onChange={(e) => onChange?.({ url: e.target.value, caption })}
              disabled={url.startsWith('data:')}
              placeholder="https://example.com/image.png"
              className="flex-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors text-sm disabled:opacity-50"
            />
            <label className="cursor-pointer shrink-0 bg-background border border-border hover:bg-surface text-text-light hover:text-text px-4 py-2.5 rounded-xl transition-colors text-sm font-medium">
              Upload
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {url.startsWith('data:') && (
              <button
                onClick={() => onChange?.({ url: '', caption })}
                className="shrink-0 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-text-light">Caption (Optional)</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => onChange?.({ url, caption: e.target.value })}
            placeholder="A short description of the image"
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-text placeholder-text-light/50 focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
      </div>
    </div>
  );
}
