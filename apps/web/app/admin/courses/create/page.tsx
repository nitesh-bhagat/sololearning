'use client';

import React, { useState } from 'react';
import { Button } from '@sololearning/ui';
import {
  Plus,
  Trash2,
  ArrowLeft,
  GripVertical,
  FileText,
  Save,
  Edit2,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { WidgetList } from '../../../../components/WidgetList';
import {
  TextBlock,
  MCQBlock,
  InfoCardBlock,
  WarningCardBlock,
  ErrorCardBlock,
  ImageBlock,
  CodeBlock,
  DivideBlock,
  BulletsBlock,
  TableBlock,
  NotesBlock,
  GraphsBlock,
  MatchPairBlock,
  PutInOrderBlock,
  FillBlanksBlock,
  AIShortQuestionBlock,
} from '@sololearning/ui';

type BlockContent = any;

type Topic = {
  id: string;
  title: string;
  type: 'block';
  content: BlockContent[];
};

type Chapter = {
  id: string;
  title: string;
  topics: Topic[];
};

export default function CreateCoursePage() {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Side panel state
  const [activeBlock, setActiveBlock] = useState<{ chapterId: string; topicId: string } | null>(
    null,
  );

  const activeTopic = activeBlock
    ? chapters
        .find((c) => c.id === activeBlock.chapterId)
        ?.topics.find((t) => t.id === activeBlock.topicId)
    : null;

  const addChapter = () => {
    setChapters([
      ...chapters,
      {
        id: `ch-${Date.now()}`,
        title: `Chapter ${chapters.length + 1}`,
        topics: [],
      },
    ]);
  };

  const updateChapterTitle = (chapterId: string, title: string) => {
    setChapters(chapters.map((ch) => (ch.id === chapterId ? { ...ch, title } : ch)));
  };

  const removeChapter = (chapterId: string) => {
    setChapters(chapters.filter((ch) => ch.id !== chapterId));
  };

  const addTopic = (chapterId: string) => {
    const topicId = `t-${Date.now()}`;
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            topics: [
              ...ch.topics,
              {
                id: topicId,
                title: `New Block`,
                type: 'block',
                content: [],
              },
            ],
          };
        }
        return ch;
      }),
    );
    // Automatically open side panel for the new block
    setActiveBlock({ chapterId, topicId });
  };

  const updateTopicTitle = (chapterId: string, topicId: string, title: string) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            topics: ch.topics.map((t) => (t.id === topicId ? { ...t, title } : t)),
          };
        }
        return ch;
      }),
    );
  };

  const updateTopicContent = (chapterId: string, topicId: string, content: any[]) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            topics: ch.topics.map((t) => (t.id === topicId ? { ...t, content } : t)),
          };
        }
        return ch;
      }),
    );
  };

  const handleWidgetSelect = (widgetId: string) => {
    if (!activeBlock || !activeTopic) return;

    let newBlockContent: any;
    switch (widgetId) {
      case 'text':
        newBlockContent = { type: 'text', content: '' };
        break;
      case 'mcq':
        newBlockContent = {
          type: 'mcq',
          question: '',
          options: ['', '', '', ''],
          answer: 0,
          explanation: '',
        };
        break;
      case 'info-card':
        newBlockContent = { type: 'info-card', content: '' };
        break;
      case 'warning-card':
        newBlockContent = { type: 'warning-card', content: '' };
        break;
      case 'error-card':
        newBlockContent = { type: 'error-card', content: '' };
        break;
      case 'image':
        newBlockContent = { type: 'image', url: '', caption: '' };
        break;
      case 'code-block':
        newBlockContent = { type: 'code-block', code: '', explanation: '' };
        break;
      case 'divide':
        newBlockContent = { type: 'divide' };
        break;
      case 'bullets':
        newBlockContent = { type: 'bullets', items: ['', ''] };
        break;
      case 'table':
        newBlockContent = {
          type: 'table',
          headers: ['Col 1', 'Col 2'],
          rows: [
            ['', ''],
            ['', ''],
          ],
        };
        break;
      case 'notes':
        newBlockContent = { type: 'notes', content: '' };
        break;
      case 'graphs':
        newBlockContent = { type: 'graphs', title: '', data: '' };
        break;
      case 'match-pair':
        newBlockContent = { type: 'match-pair', pairs: [{ left: '', right: '' }] };
        break;
      case 'put-in-order':
        newBlockContent = { type: 'put-in-order', items: ['', '', ''] };
        break;
      case 'fill-blanks':
        newBlockContent = {
          type: 'fill-blanks',
          question: 'The ______ function is used to collect information.',
          blankAnswers: ['input'],
          explanation: '',
        };
        break;
      case 'ai-short-question':
        newBlockContent = { type: 'ai-short-question', question: '', gradingCriteria: '' };
        break;
      default:
        newBlockContent = { type: widgetId, content: '' };
    }

    const newContentArray = [...(activeTopic.content || []), newBlockContent];
    updateTopicContent(activeBlock.chapterId, activeBlock.topicId, newContentArray);
  };

  const handleBlockChange = (index: number, updatedData: any) => {
    if (!activeBlock || !activeTopic) return;

    const newContentArray = [...activeTopic.content];
    newContentArray[index] = { ...newContentArray[index], ...updatedData };
    updateTopicContent(activeBlock.chapterId, activeBlock.topicId, newContentArray);
  };

  const moveBlockUp = (index: number) => {
    if (!activeBlock || !activeTopic || index === 0) return;
    const newContent = [...activeTopic.content];
    [newContent[index - 1], newContent[index]] = [newContent[index], newContent[index - 1]];
    updateTopicContent(activeBlock.chapterId, activeBlock.topicId, newContent);
  };

  const moveBlockDown = (index: number) => {
    if (!activeBlock || !activeTopic || index === activeTopic.content.length - 1) return;
    const newContent = [...activeTopic.content];
    [newContent[index + 1], newContent[index]] = [newContent[index], newContent[index + 1]];
    updateTopicContent(activeBlock.chapterId, activeBlock.topicId, newContent);
  };

  const deleteBlock = (index: number) => {
    if (!activeBlock || !activeTopic) return;
    const newContent = activeTopic.content.filter((_: any, i: number) => i !== index);
    updateTopicContent(activeBlock.chapterId, activeBlock.topicId, newContent);
  };

  const removeTopic = (chapterId: string, topicId: string) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            topics: ch.topics.filter((t) => t.id !== topicId),
          };
        }
        return ch;
      }),
    );
  };

  const handleSave = () => {
    console.log({
      title: courseTitle,
      description: courseDescription,
      chapters,
    });
    // Implement actual save logic here
  };

  return (
    <div className="p-10 max-w-5xl mx-auto flex flex-col gap-8 min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/courses"
            className="p-2 hover:bg-surface rounded-full transition-colors border border-border bg-background"
          >
            <ArrowLeft size={20} className="text-text-light" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-text tracking-tight">Create New Course</h1>
            <p className="text-text-light text-sm mt-1">
              Design the curriculum and add content blocks.
            </p>
          </div>
        </div>
        <Button variant="primary" className="flex items-center gap-2 px-6" onClick={handleSave}>
          <Save size={18} />
          Save Course
        </Button>
      </div>

      {/* Basic Info Section */}
      <div className="bg-surface shadow-sm border border-border rounded-[2rem] p-8 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-text tracking-tight">Basic Information</h2>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-light uppercase tracking-wider ml-1">
              Course Title
            </label>
            <input
              type="text"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g., Advanced JavaScript Patterns"
              className="bg-background border border-border rounded-2xl px-4 py-3.5 text-text placeholder-text-light/40 focus:outline-none focus:border-primary transition-colors text-lg font-bold"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-text-light uppercase tracking-wider ml-1">
              Description
            </label>
            <textarea
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              placeholder="Briefly describe what students will learn..."
              rows={4}
              className="bg-background border border-border rounded-2xl px-4 py-3.5 text-text placeholder-text-light/40 focus:outline-none focus:border-primary transition-colors resize-none text-[0.95rem]"
            />
          </div>
        </div>
      </div>

      {/* Curriculum Builder Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-text tracking-tight">Curriculum Structure</h2>
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
            onClick={addChapter}
          >
            <Plus size={16} />
            Add Chapter
          </Button>
        </div>

        {chapters.length === 0 ? (
          <div className="bg-surface/50 border-2 border-dashed border-border rounded-[2rem] p-12 flex flex-col items-center justify-center text-center text-text-light">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border border-border mb-4">
              <Plus size={24} className="text-text-light" />
            </div>
            <h3 className="text-lg font-bold text-text mb-1">No Chapters Yet</h3>
            <p className="text-sm max-w-xs">
              Start building your course structure by adding the first chapter.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="bg-surface border border-border rounded-[2rem] overflow-hidden shadow-sm"
              >
                {/* Chapter Header */}
                <div className="bg-background p-4 flex items-center gap-4 border-b border-border">
                  <div className="cursor-grab text-text-light hover:text-text transition-colors p-1">
                    <GripVertical size={20} />
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={chapter.title}
                    onChange={(e) => updateChapterTitle(chapter.id, e.target.value)}
                    className="flex-1 bg-transparent border-none text-lg font-bold text-text focus:outline-none placeholder-text-light/50"
                    placeholder="Chapter Title"
                  />
                  <button
                    onClick={() => removeChapter(chapter.id)}
                    className="p-2 text-text-light hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Topics List */}
                <div className="p-4 flex flex-col gap-3">
                  {chapter.topics.length === 0 ? (
                    <div className="text-sm text-text-light text-center py-4 italic">
                      No blocks added to this chapter.
                    </div>
                  ) : (
                    chapter.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center gap-3 bg-background border border-border rounded-xl p-3 group hover:border-primary/50 transition-colors ml-10"
                      >
                        <div className="cursor-grab text-text-light/50 hover:text-text transition-colors">
                          <GripVertical size={16} />
                        </div>
                        <div className="p-1.5 rounded-lg shrink-0 bg-blue-500/10 text-blue-500">
                          <FileText size={16} />
                        </div>
                        <div className="flex flex-col flex-1">
                          <input
                            type="text"
                            value={topic.title}
                            onChange={(e) => updateTopicTitle(chapter.id, topic.id, e.target.value)}
                            className="bg-transparent border-none text-sm font-medium text-text focus:outline-none placeholder-text-light/50"
                            placeholder="Block Title"
                          />
                          <span className="text-[10px] text-text-light font-bold uppercase tracking-wider mt-0.5">
                            {topic.content?.length || 0} Widgets
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setActiveBlock({ chapterId: chapter.id, topicId: topic.id })
                          }
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-text-light hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => removeTopic(chapter.id, topic.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-text-light hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}

                  {/* Add Block Button */}
                  <div className="flex items-center gap-3 ml-10 mt-2">
                    <button
                      onClick={() => addTopic(chapter.id)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-lg transition-all"
                    >
                      <Plus size={14} /> Add Block
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side Panel for Add/Edit Block */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[80%] bg-background border-l border-border z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${
          activeBlock ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text tracking-tight">Add/Edit Block</h2>
            <p className="text-xs text-text-light mt-1">
              Select widgets to build this block's content.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setActiveBlock(null)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => setIsPreviewMode(true)}>
              Preview Lesson
            </Button>
            <Button variant="primary" onClick={() => setActiveBlock(null)}>
              Save
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-background">
          <div className="h-full flex bg-background">
            {/* Embedded Course Editor Sidebar */}
            <div className="border-r border-border overflow-hidden shadow-xl z-10 flex flex-col w-80 bg-surface">
              <WidgetList onWidgetSelect={handleWidgetSelect} />
            </div>

            {/* Embedded Course Editor Canvas */}
            <div className="flex-1 bg-surface flex flex-col overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>

              <div className="flex-1 overflow-y-auto p-10 z-10 flex flex-col gap-6 relative">
                {!activeTopic || !activeTopic.content || activeTopic.content.length === 0 ? (
                  <div className="bg-surface p-8 rounded-3xl border border-border shadow-lg text-center max-w-sm mx-auto my-auto">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                      <span className="text-3xl font-black">✨</span>
                    </div>
                    <h3 className="text-xl font-black text-text mb-3 tracking-tight">
                      Editor Canvas Area
                    </h3>
                    <p className="text-sm text-text-light leading-relaxed">
                      Select a widget from the sidebar to preview it here and build your block
                      content.
                    </p>
                  </div>
                ) : (
                  activeTopic.content.map((blockData, idx) => {
                    const renderBlock = () => {
                      switch (blockData.type) {
                        case 'text':
                          return (
                            <TextBlock
                              {...blockData}
                              onChange={(val: string) => handleBlockChange(idx, { content: val })}
                            />
                          );
                        case 'mcq':
                          return (
                            <MCQBlock
                              {...blockData}
                              onChange={(val: any) => handleBlockChange(idx, val)}
                            />
                          );
                        case 'info-card':
                          return (
                            <InfoCardBlock
                              {...blockData}
                              onChange={(val: string) => handleBlockChange(idx, { content: val })}
                            />
                          );
                        case 'warning-card':
                          return (
                            <WarningCardBlock
                              {...blockData}
                              onChange={(val: string) => handleBlockChange(idx, { content: val })}
                            />
                          );
                        case 'error-card':
                          return (
                            <ErrorCardBlock
                              {...blockData}
                              onChange={(val: string) => handleBlockChange(idx, { content: val })}
                            />
                          );
                        case 'image':
                          return (
                            <ImageBlock
                              {...blockData}
                              onChange={(val: any) => handleBlockChange(idx, val)}
                            />
                          );
                        case 'code-block':
                          return (
                            <CodeBlock
                              {...blockData}
                              onChange={(val: any) => handleBlockChange(idx, val)}
                            />
                          );
                        case 'divide':
                          return <DivideBlock />;
                        case 'bullets':
                          return (
                            <BulletsBlock
                              {...blockData}
                              onChange={(val: string[]) => handleBlockChange(idx, { items: val })}
                            />
                          );
                        case 'table':
                          return (
                            <TableBlock
                              {...blockData}
                              onChange={(val: any) => handleBlockChange(idx, val)}
                            />
                          );
                        case 'notes':
                          return (
                            <NotesBlock
                              {...blockData}
                              onChange={(val: string) => handleBlockChange(idx, { content: val })}
                            />
                          );
                        case 'graphs':
                          return (
                            <GraphsBlock
                              {...blockData}
                              onChange={(val: any) => handleBlockChange(idx, val)}
                            />
                          );
                        case 'match-pair':
                          return (
                            <MatchPairBlock
                              {...blockData}
                              onChange={(val: any) => handleBlockChange(idx, { pairs: val })}
                            />
                          );
                        case 'put-in-order':
                          return (
                            <PutInOrderBlock
                              {...blockData}
                              onChange={(val: string[]) => handleBlockChange(idx, { items: val })}
                            />
                          );
                        case 'fill-blanks':
                          return (
                            <FillBlanksBlock
                              {...blockData}
                              onChange={(val: any) => handleBlockChange(idx, val)}
                            />
                          );
                        case 'ai-short-question':
                          return (
                            <AIShortQuestionBlock
                              {...blockData}
                              onChange={(val: any) => handleBlockChange(idx, val)}
                            />
                          );
                        default:
                          return (
                            <div className="p-4 bg-background border border-dashed border-border rounded-xl text-center text-text-light">
                              Unsupported widget type: {blockData.type}
                            </div>
                          );
                      }
                    };

                    return (
                      <div
                        key={idx}
                        className="relative group p-4 border-2 border-transparent hover:border-primary/20 rounded-2xl transition-colors"
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-surface shadow-sm border border-border rounded-lg p-1 z-20 transition-opacity">
                          <button
                            onClick={() => moveBlockUp(idx)}
                            disabled={idx === 0}
                            className="p-1.5 text-text-light hover:text-text hover:bg-primary/10 rounded-md disabled:opacity-30"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveBlockDown(idx)}
                            disabled={idx === activeTopic.content.length - 1}
                            className="p-1.5 text-text-light hover:text-text hover:bg-primary/10 rounded-md disabled:opacity-30"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <div className="w-px h-4 bg-border mx-1"></div>
                          <button
                            onClick={() => deleteBlock(idx)}
                            className="p-1.5 text-text-light hover:text-red-500 hover:bg-red-500/10 rounded-md"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="pt-4">{renderBlock()}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewMode && activeTopic && (
        <div className="fixed inset-0 bg-background z-[100] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface shrink-0 shadow-sm z-10">
            <div>
              <h2 className="text-xl font-bold text-text tracking-tight">
                Preview: {activeTopic.title}
              </h2>
              <p className="text-xs text-text-light mt-0.5">
                This is exactly how the student will see this lesson.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsPreviewMode(false)}
              className="flex items-center gap-2"
            >
              <X size={18} /> Close Preview
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-10 bg-background relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>
            <div className="max-w-3xl mx-auto flex flex-col gap-8 relative z-10">
              {activeTopic.content?.map((blockData: any, idx: number) => {
                const renderReadOnlyBlock = () => {
                  switch (blockData.type) {
                    case 'text':
                      return <TextBlock {...blockData} readOnly={true} />;
                    case 'mcq':
                      return <MCQBlock {...blockData} readOnly={true} />;
                    case 'info-card':
                      return <InfoCardBlock {...blockData} readOnly={true} />;
                    case 'warning-card':
                      return <WarningCardBlock {...blockData} readOnly={true} />;
                    case 'error-card':
                      return <ErrorCardBlock {...blockData} readOnly={true} />;
                    case 'image':
                      return <ImageBlock {...blockData} readOnly={true} />;
                    case 'code-block':
                      return <CodeBlock {...blockData} readOnly={true} />;
                    case 'divide':
                      return <DivideBlock />;
                    case 'bullets':
                      return <BulletsBlock {...blockData} readOnly={true} />;
                    case 'table':
                      return <TableBlock {...blockData} readOnly={true} />;
                    case 'notes':
                      return <NotesBlock {...blockData} readOnly={true} />;
                    case 'graphs':
                      return <GraphsBlock {...blockData} readOnly={true} />;
                    case 'match-pair':
                      return <MatchPairBlock {...blockData} readOnly={true} />;
                    case 'put-in-order':
                      return <PutInOrderBlock {...blockData} readOnly={true} />;
                    case 'fill-blanks':
                      return <FillBlanksBlock {...blockData} readOnly={true} />;
                    case 'ai-short-question':
                      return <AIShortQuestionBlock {...blockData} readOnly={true} />;
                    default:
                      return null;
                  }
                };
                return <div key={idx}>{renderReadOnlyBlock()}</div>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
