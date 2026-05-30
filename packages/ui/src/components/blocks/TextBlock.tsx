'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Type,
} from 'lucide-react';

export interface TextBlockProps {
  content: string;
  onChange?: (content: string) => void;
  readOnly?: boolean;
}

export function TextBlock({ content, onChange, readOnly = false }: TextBlockProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'tiptap-editor-content outline-none min-h-[120px] text-text text-base leading-relaxed',
      },
    },
  });

  // Update content when props change from external source
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  // Tiptap raw HTML renderer style block
  const EditorStyles = (
    <style>{`
      .tiptap-editor-content h1 { font-size: 2.25rem; font-weight: 800; line-height: 1.2; margin-bottom: 0.5rem; margin-top: 1rem; }
      .tiptap-editor-content h2 { font-size: 1.875rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.5rem; margin-top: 1rem; }
      .tiptap-editor-content h3 { font-size: 1.5rem; font-weight: 700; line-height: 1.4; margin-bottom: 0.5rem; margin-top: 1rem; }
      .tiptap-editor-content p { margin-bottom: 0.75rem; }
      .tiptap-editor-content p:last-child { margin-bottom: 0; }
      .tiptap-editor-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
      .tiptap-editor-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
      .tiptap-editor-content a { color: #10b981; text-decoration: underline; cursor: pointer; }
      .tiptap-editor-content b, .tiptap-editor-content strong { font-weight: 700; }
    `}</style>
  );

  if (readOnly) {
    return (
      <div className="text-text leading-relaxed text-base">
        {EditorStyles}
        <div
          className="tiptap-editor-content"
          dangerouslySetInnerHTML={{
            __html: content || '<p class="text-text-light italic">Empty text block</p>',
          }}
        />
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const ToolbarButton = ({ onClick, active, disabled = false, children, title }: any) => (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-primary/20 text-primary' : 'text-text-light hover:bg-surface hover:text-text'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col gap-3 w-full bg-surface p-5 rounded-2xl border border-border">
      {EditorStyles}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-bold text-text-light uppercase tracking-wider flex items-center gap-1.5">
          <Type size={14} /> Text Block
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-background border border-border rounded-xl shadow-sm">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </ToolbarButton>
        <div className="w-px h-5 bg-border mx-1"></div>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Link">
          <LinkIcon size={16} />
        </ToolbarButton>
        <div className="w-px h-5 bg-border mx-1"></div>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </ToolbarButton>
      </div>

      <div
        className="bg-background border border-border rounded-xl px-5 py-4 min-h-[140px] shadow-inner cursor-text"
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
