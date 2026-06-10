'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@sololearning/ui';
import {
  X,
  ArrowDown,
  ArrowUp,
  Edit2,
  Save,
  FileText,
  GripVertical,
  ArrowLeft,
  Trash2,
  Plus,
  Eye,
  Check,
  Image as ImageIcon,
  UploadCloud,
  Info,
  Award,
  Star,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { RenderLesson } from '../../../../../components/RenderLesson';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragCancelEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetList } from '../../../../../components/WidgetList';
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
  excercise: BlockContent[];
  metadata?: {
    difficulty: string;
    xp: number;
  };
};

type Chapter = {
  id: string;
  title: string;
  topics: Topic[];
};

const SortableBlockItem = ({ blockData, idx, handleBlockChange, deleteBlock }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: blockData.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

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
        return <MCQBlock {...blockData} onChange={(val: any) => handleBlockChange(idx, val)} />;
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
        return <ImageBlock {...blockData} onChange={(val: any) => handleBlockChange(idx, val)} />;
      case 'code-block':
        return <CodeBlock {...blockData} onChange={(val: any) => handleBlockChange(idx, val)} />;
      case 'divide':
        return <DivideBlock />;
      case 'table':
        return <TableBlock {...blockData} onChange={(val: any) => handleBlockChange(idx, val)} />;
      case 'notes':
        return (
          <NotesBlock
            {...blockData}
            onChange={(val: string) => handleBlockChange(idx, { content: val })}
          />
        );
      case 'graphs':
        return <GraphsBlock {...blockData} onChange={(val: any) => handleBlockChange(idx, val)} />;
      case 'match-pair':
        return (
          <MatchPairBlock {...blockData} onChange={(val: any) => handleBlockChange(idx, val)} />
        );
      case 'put-in-order':
        return (
          <PutInOrderBlock {...blockData} onChange={(val: any) => handleBlockChange(idx, val)} />
        );
      case 'fill-blanks':
        return (
          <FillBlanksBlock {...blockData} onChange={(val: any) => handleBlockChange(idx, val)} />
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
      ref={setNodeRef}
      style={style}
      className="relative group p-4 border-2 border-transparent hover:border-primary/20 rounded-2xl transition-colors bg-surface"
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-surface shadow-sm border border-border rounded-lg p-1 z-20 transition-opacity">
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 text-text-light hover:text-text hover:bg-primary/10 rounded-md cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </div>
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
};

import { useParams, useRouter } from 'next/navigation';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.course_id as string;

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeDragWidget, setActiveDragWidget] = useState<string | null>(null);
  const [dragHoverIndex, setDragHoverIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'excercise' | 'preview'>('content');

  // Course Metadata State
  const [courseImage, setCourseImage] = useState('');
  const [courseTags, setCourseTags] = useState<string[]>([]);
  const [courseXP, setCourseXP] = useState(0);
  const [tagInput, setTagInput] = useState('');

  // Side panel state
  const [activeBlock, setActiveBlock] = useState<{ chapterId: string; topicId: string } | null>(
    null,
  );

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/admin/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourseTitle(data.title || '');
          setCourseDescription(data.description || '');
          setCourseImage(data.image || '');
          setCourseTags(data.tags || []);
          setCourseXP(data.totalXp || 0);

          if (data.chapters) {
            setChapters(
              data.chapters.map((ch: any) => ({
                id: ch.id,
                title: ch.title,
                topics: ch.topics.map((t: any) => ({
                  id: t.id,
                  title: t.title,
                  type: 'block',
                  content: t.content || [],
                  excercise: t.excercise || [],
                  metadata: { difficulty: 'Beginner', xp: t.xpReward || 50 },
                })),
              })),
            );
          }
        }
      } catch (err) {
        console.error('Failed to fetch course', err);
      }
    }
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    if (activeBlock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeBlock]);

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
                excercise: [],
                metadata: { difficulty: 'Beginner', xp: 10 },
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

  const updateTopicData = (
    chapterId: string,
    topicId: string,
    key: 'content' | 'excercise',
    data: any[],
  ) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            topics: ch.topics.map((t) => (t.id === topicId ? { ...t, [key]: data } : t)),
          };
        }
        return ch;
      }),
    );
  };

  const updateTopicMetadata = (chapterId: string, topicId: string, metadata: any) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            topics: ch.topics.map((t) =>
              t.id === topicId ? { ...t, metadata: { ...t.metadata, ...metadata } } : t,
            ),
          };
        }
        return ch;
      }),
    );
  };

  const createNewBlock = (widgetId: string) => {
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
        newBlockContent = { type: 'code-block', code: '', language: 'javascript', explanation: '' };
        break;
      case 'divide':
        newBlockContent = { type: 'divide' };
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

    newBlockContent.id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return newBlockContent;
  };

  const renderPreviewPlayer = () => {
    if (!activeTopic) return null;
    return <RenderLesson topic={activeTopic} onExit={() => setActiveTab('content')} />;
  };

  const handleWidgetSelect = (widgetId: string) => {
    if (!activeBlock || !activeTopic) return;

    const newBlockContent = createNewBlock(widgetId);
    const activeArray =
      activeTab === 'excercise' ? activeTopic.excercise || [] : activeTopic.content || [];
    const newContentArray = [...activeArray, newBlockContent];
    updateTopicData(activeBlock.chapterId, activeBlock.topicId, activeTab, newContentArray);
  };

  const handleBlockChange = (index: number, updatedData: any) => {
    if (!activeBlock || !activeTopic) return;
    const activeArray =
      activeTab === 'excercise' ? activeTopic.excercise || [] : activeTopic.content || [];
    const newContentArray = [...activeArray];
    newContentArray[index] = { ...newContentArray[index], ...updatedData };
    updateTopicData(activeBlock.chapterId, activeBlock.topicId, activeTab, newContentArray);
  };

  const moveBlockUp = (index: number) => {
    if (!activeBlock || !activeTopic || index === 0) return;
    const activeArray =
      activeTab === 'excercise' ? activeTopic.excercise || [] : activeTopic.content || [];
    const newContent = [...activeArray];
    [newContent[index - 1], newContent[index]] = [newContent[index], newContent[index - 1]];
    updateTopicData(activeBlock.chapterId, activeBlock.topicId, activeTab, newContent);
  };

  const moveBlockDown = (index: number) => {
    if (!activeBlock || !activeTopic) return;
    const activeArray =
      activeTab === 'excercise' ? activeTopic.excercise || [] : activeTopic.content || [];
    if (index === activeArray.length - 1) return;
    const newContent = [...activeArray];
    [newContent[index + 1], newContent[index]] = [newContent[index], newContent[index + 1]];
    updateTopicData(activeBlock.chapterId, activeBlock.topicId, activeTab, newContent);
  };

  const deleteBlock = (index: number) => {
    if (!activeBlock || !activeTopic) return;
    const activeArray =
      activeTab === 'excercise' ? activeTopic.excercise || [] : activeTopic.content || [];
    const newContent = activeArray.filter((_: any, i: number) => i !== index);
    updateTopicData(activeBlock.chapterId, activeBlock.topicId, activeTab, newContent);
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

  const handleSave = async () => {
    try {
      const payload = {
        title: courseTitle,
        description: courseDescription,
        image: courseImage,
        tags: courseTags,
        subject: 'General',
        totalXp: chapters.reduce((total, ch) => {
          return total + ch.topics.reduce((tTotal, t) => tTotal + (t.metadata?.xp || 50), 0);
        }, 0),
        chapters,
      };

      const res = await fetch(`/api/admin/courses/${courseId}/full`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to update course');
      }

      alert(`Course updated successfully!`);
      router.push('/admin/courses');
    } catch (error) {
      console.error(error);
      alert('Error updating course. Please try again.');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'widget') {
      setActiveDragWidget(event.active.data.current.widgetId);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeTopic) {
      setDragHoverIndex(null);
      return;
    }

    const activeArray =
      activeTab === 'excercise' ? activeTopic.excercise || [] : activeTopic.content || [];

    if (active.data.current?.type === 'widget') {
      const overId = over.id;
      const overIndex = activeArray.findIndex((b: any) => b.id === overId);
      setDragHoverIndex(overIndex !== -1 ? overIndex : activeArray.length);
    }
  };

  const handleDragCancel = () => {
    setActiveDragWidget(null);
    setDragHoverIndex(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragWidget(null);
    setDragHoverIndex(null);

    const { active, over } = event;
    if (!over || !activeTopic) return;

    const activeArray =
      activeTab === 'excercise' ? activeTopic.excercise || [] : activeTopic.content || [];

    if (active.data.current?.type === 'widget') {
      const widgetId = active.data.current.widgetId;
      const overId = over.id;
      const overIndex = activeArray.findIndex((b: any) => b.id === overId);

      const newBlock = createNewBlock(widgetId);
      const newContentArray = [...activeArray];

      if (overIndex !== -1) {
        newContentArray.splice(overIndex, 0, newBlock);
      } else {
        newContentArray.push(newBlock);
      }
      updateTopicData(activeBlock.chapterId, activeBlock.topicId, activeTab, newContentArray);
    } else {
      if (active.id !== over.id) {
        const oldIndex = activeArray.findIndex((b: any) => b.id === active.id);
        const newIndex = activeArray.findIndex((b: any) => b.id === over.id);

        const newContent = arrayMove(activeArray, oldIndex, newIndex);
        updateTopicData(activeBlock.chapterId, activeBlock.topicId, activeTab, newContent);
      }
    }
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
            <h1 className="text-3xl font-black text-text tracking-tight">Edit Course</h1>
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

      {/* Course Details Section */}
      <div className="bg-surface shadow-sm border border-border rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-border bg-background">
          <h2 className="text-xl font-bold text-text tracking-tight">Course Details</h2>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10">
          {/* Left Column: Image Upload */}
          <div className="flex flex-col gap-4">
            <label className="text-sm font-bold text-text-light uppercase tracking-wider">
              Course Cover Image
            </label>
            <div className="relative group rounded-[2rem] overflow-hidden border-2 border-dashed border-border bg-background aspect-square flex flex-col items-center justify-center transition-all hover:border-primary/50 hover:bg-primary/5">
              {courseImage ? (
                <>
                  <img
                    src={courseImage}
                    alt="Course Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" onClick={() => setCourseImage('')}>
                      Remove
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-text-light group-hover:text-primary group-hover:scale-110 transition-all">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">Upload Image</p>
                    <p className="text-xs text-text-light mt-1">Drag and drop or click to browse</p>
                  </div>
                  {/* Simulated File Input */}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCourseImage(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Metadata Inputs */}
          <div className="flex flex-col gap-8">
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
                rows={3}
                className="bg-background border border-border rounded-2xl px-4 py-3.5 text-text placeholder-text-light/40 focus:outline-none focus:border-primary transition-colors resize-none text-[0.95rem]"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Tags Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-light uppercase tracking-wider ml-1">
                  Tags
                </label>
                <div className="bg-background border border-border rounded-2xl p-2 flex flex-wrap gap-2 focus-within:border-primary transition-colors min-h-[58px]">
                  {courseTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-surface border border-border text-text text-sm font-medium px-3 py-1 rounded-xl flex items-center gap-1.5"
                    >
                      {tag}
                      <button
                        onClick={() => setCourseTags((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-text-light hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tagInput.trim()) {
                        e.preventDefault();
                        if (!courseTags.includes(tagInput.trim())) {
                          setCourseTags((prev) => [...prev, tagInput.trim()]);
                        }
                        setTagInput('');
                      }
                    }}
                    placeholder={courseTags.length === 0 ? 'Add tags and press enter...' : ''}
                    className="bg-transparent border-none focus:outline-none text-text text-sm px-2 py-1 flex-1 min-w-[120px]"
                  />
                </div>
              </div>

              {/* XP Points */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-light uppercase tracking-wider ml-1">
                  Accumulative Points
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={courseXP || ''}
                    onChange={(e) => setCourseXP(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 580"
                    className="w-full bg-background border border-border rounded-2xl pl-12 pr-4 py-3.5 text-text placeholder-text-light/40 focus:outline-none focus:border-primary transition-colors text-lg font-bold"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary">
                    XP
                  </div>
                </div>
                <p className="text-xs text-text-light ml-1">Total points a user can earn.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Builder Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-text tracking-tight">Curriculum Structure</h2>
        </div>

        {chapters.length === 0 ? (
          <div className="bg-surface/50 border-2 border-dashed border-border rounded-[2rem] p-12 flex flex-col items-center justify-center text-center text-text-light">
            <button
              onClick={addChapter}
              className="w-16 h-16 bg-background hover:bg-primary/10 rounded-full flex items-center justify-center border border-border hover:border-primary/50 hover:text-primary transition-all mb-4"
            >
              <Plus size={24} />
            </button>
            <h3 className="text-lg font-bold text-text mb-1">No Chapters Yet</h3>
            <p className="text-sm max-w-xs mb-4">
              Start building your course structure by adding the first chapter.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
              onClick={addChapter}
            >
              <Plus size={16} />
              Add First Chapter
            </Button>
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
            <div className="flex justify-center mt-2">
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
          </div>
        )}
      </div>

      {/* Side Panel for Add/Edit Block */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          className={`fixed top-0 right-0 bottom-0 w-[80%] bg-background border-l border-border z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${
            activeBlock ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-border bg-surface shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveBlock(null)}
                className="flex items-center gap-1.5 text-text-light hover:text-text transition-colors p-2 rounded-lg hover:bg-white/5"
              >
                <ArrowLeft size={16} />
                <span className="text-sm font-medium">Go back</span>
              </button>
              <div className="h-6 w-px bg-border"></div>
              <div>
                <input
                  value={activeTopic?.title || ''}
                  onChange={(e) => {
                    if (activeBlock) {
                      updateTopicTitle(activeBlock.chapterId, activeBlock.topicId, e.target.value);
                    }
                  }}
                  className="text-xl font-bold text-text tracking-tight bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary/50 rounded px-1 w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-xs py-1.5 px-3 h-8"
                onClick={() => setActiveBlock(null)}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                className="text-xs py-1.5 px-3 h-8 bg-surface hover:bg-surface-light flex items-center gap-1.5 border border-border"
                onClick={() => setActiveTab('preview')}
              >
                <Eye size={14} /> Preview Lesson
              </Button>
              <Button
                variant="ghost"
                className="text-xs py-1.5 px-3 h-8 bg-surface hover:bg-surface-light flex items-center gap-1.5 border border-border"
              >
                Save as draft
              </Button>
              {activeTab === 'content' && (
                <Button
                  variant="primary"
                  className="text-xs py-1.5 px-3 h-8"
                  onClick={() => setActiveTab('excercise')}
                >
                  Next
                </Button>
              )}
              {activeTab === 'excercise' && (
                <>
                  <Button
                    variant="ghost"
                    className="text-xs py-1.5 px-3 h-8"
                    onClick={() => setActiveTab('content')}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    className="text-xs py-1.5 px-3 h-8"
                    onClick={() => setActiveBlock(null)}
                  >
                    Save
                  </Button>
                </>
              )}
              {activeTab === 'preview' && (
                <>
                  <Button
                    variant="ghost"
                    className="text-xs py-1.5 px-3 h-8"
                    onClick={() => setActiveTab('excercise')}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    className="text-xs py-1.5 px-3 h-8"
                    onClick={() => setActiveBlock(null)}
                  >
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col bg-background">
            <div className="h-full flex bg-background">
              {/* Embedded Course Editor Sidebar */}
              <div className="border-r border-border overflow-hidden shadow-xl z-10 flex flex-col w-80 bg-surface">
                {activeTab === 'preview' ? (
                  <div className="p-6 flex flex-col gap-6 h-full overflow-y-auto">
                    <div>
                      <h2 className="text-lg font-bold text-text mb-1">Block Metadata</h2>
                      <p className="text-xs text-text-light">Configure details for this block.</p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-light uppercase tracking-wider">
                          Difficulty
                        </label>
                        <select
                          value={activeTopic?.metadata?.difficulty || 'Beginner'}
                          onChange={(e) => {
                            if (activeBlock)
                              updateTopicMetadata(activeBlock.chapterId, activeBlock.topicId, {
                                difficulty: e.target.value,
                              });
                          }}
                          className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-text-light uppercase tracking-wider">
                          XP Points
                        </label>
                        <input
                          type="number"
                          value={activeTopic?.metadata?.xp || 10}
                          onChange={(e) => {
                            if (activeBlock)
                              updateTopicMetadata(activeBlock.chapterId, activeBlock.topicId, {
                                xp: parseInt(e.target.value) || 0,
                              });
                          }}
                          className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <WidgetList onWidgetSelect={handleWidgetSelect} activeTab={activeTab} />
                )}
              </div>

              {/* Embedded Course Editor Canvas */}
              <div className="flex-1 bg-surface flex flex-col overflow-hidden relative">
                <div className="flex border-b border-border bg-surface shrink-0 z-20">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text hover:bg-white/5'}`}
                  >
                    Edit content
                  </button>
                  <button
                    onClick={() => setActiveTab('excercise')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'excercise' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text hover:bg-white/5'}`}
                  >
                    Edit Excersize
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text hover:bg-white/5'}`}
                  >
                    Preview Lesson
                  </button>
                </div>

                {activeTab === 'preview' ? (
                  renderPreviewPlayer()
                ) : (
                  <>
                    <div className="absolute inset-0 top-[45px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>

                    <div className="flex-1 overflow-y-auto p-10 z-10 flex flex-col gap-6 relative">
                      {(() => {
                        const currentArray =
                          activeTab === 'excercise'
                            ? activeTopic?.excercise || []
                            : activeTopic?.content || [];
                        if (!activeTopic || currentArray.length === 0) {
                          return (
                            <div className="bg-surface p-8 rounded-3xl border border-border shadow-lg text-center max-w-sm mx-auto my-auto">
                              <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                <span className="text-3xl font-black">✨</span>
                              </div>
                              <h3 className="text-xl font-black text-text mb-3 tracking-tight">
                                Editor Canvas Area
                              </h3>
                              <p className="text-sm text-text-light leading-relaxed">
                                Select a widget from the sidebar to preview it here and build your
                                block content.
                              </p>
                            </div>
                          );
                        }

                        return (
                          <SortableContext
                            items={currentArray.map((b: any) => b.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {currentArray.map((blockData: any, idx: number) => (
                              <React.Fragment key={blockData.id}>
                                {activeDragWidget && dragHoverIndex === idx && (
                                  <div className="h-24 border-2 border-dashed border-primary/50 bg-primary/5 rounded-2xl transition-all shadow-inner relative flex items-center justify-center">
                                    <span className="text-primary/50 font-bold tracking-wider text-sm">
                                      Drop Widget Here
                                    </span>
                                  </div>
                                )}
                                <SortableBlockItem
                                  blockData={blockData}
                                  idx={idx}
                                  handleBlockChange={handleBlockChange}
                                  deleteBlock={deleteBlock}
                                />
                              </React.Fragment>
                            ))}
                            {activeDragWidget && dragHoverIndex === currentArray.length && (
                              <div className="h-24 border-2 border-dashed border-primary/50 bg-primary/5 rounded-2xl transition-all shadow-inner relative flex items-center justify-center mt-2">
                                <span className="text-primary/50 font-bold tracking-wider text-sm">
                                  Drop Widget Here
                                </span>
                              </div>
                            )}
                          </SortableContext>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}
