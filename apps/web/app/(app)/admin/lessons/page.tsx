'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, List, Save, BookOpen } from 'lucide-react';
import styles from '../admin.module.css';
import { Skeleton, EmptyState } from '@sololearning/ui';
import { useToast } from '../../../../components/ToastProvider';

interface Topic {
  id: string;
  title: string;
  chapter: {
    title: string;
    course: { title: string };
  };
}

interface LessonContent {
  type: 'info' | 'mcq';
  text?: string;
  question?: string;
  options?: string[];
  answer?: number;
}

interface Lesson {
  id: string;
  title: string;
  order: number;
  xpReward: number;
  content: LessonContent[];
  topicId: string;
}

export default function AdminLessons() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Lesson Edit State
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Lesson>>({});
  const toast = useToast();

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (selectedTopicId) {
      fetchLessons(selectedTopicId);
    } else {
      setLessons([]);
    }
  }, [selectedTopicId]);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/admin/course-tree', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        // Flatten tree to get a list of topics
        const flatTopics: Topic[] = [];
        data.forEach((subject: any) => {
          subject.courses.forEach((course: any) => {
            course.chapters.forEach((chapter: any) => {
              chapter.topics.forEach((topic: any) => {
                flatTopics.push({
                  id: topic.id,
                  title: topic.title,
                  chapter: {
                    title: chapter.title,
                    course: { title: course.title },
                  },
                });
              });
            });
          });
        });
        setTopics(flatTopics);
      }
    } catch (err) {
      toast.error('Network error fetching topics');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (topicId: string) => {
    try {
      const res = await fetch(`/api/admin/topics/${topicId}/lessons`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLessons(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLesson = async () => {
    if (!selectedTopicId) return alert('Select a topic first');
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: 'New Lesson',
          order: lessons.length + 1,
          xpReward: 10,
          topicId: selectedTopicId,
          content: [{ type: 'info', text: 'Welcome to the new lesson!' }],
        }),
      });
      if (res.ok) {
        toast.success('New lesson added');
        fetchLessons(selectedTopicId);
      } else {
        toast.error('Failed to add lesson');
      }
    } catch (err) {
      toast.error('Network error adding lesson');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      const res = await fetch(`/api/admin/lessons/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success('Lesson deleted');
        fetchLessons(selectedTopicId);
      } else {
        toast.error('Failed to delete lesson');
      }
    } catch (err) {
      toast.error('Network error deleting lesson');
    }
  };

  const startEdit = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setEditFormData({
      title: lesson.title,
      order: lesson.order,
      xpReward: lesson.xpReward,
      content: JSON.parse(JSON.stringify(lesson.content)), // Deep copy
    });
  };

  const saveEdit = async () => {
    if (!editingLessonId) return;
    try {
      const res = await fetch(`/api/admin/lessons/${editingLessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editFormData.title,
          order: editFormData.order,
          xpReward: editFormData.xpReward,
          content: editFormData.content,
        }),
      });
      if (res.ok) {
        toast.success('Lesson saved');
        setEditingLessonId(null);
        fetchLessons(selectedTopicId);
      } else {
        toast.error('Failed to save lesson');
      }
    } catch (err) {
      toast.error('Network error saving lesson');
    }
  };

  const addStep = (type: 'info' | 'mcq') => {
    setEditFormData((prev) => {
      const currentContent = prev.content || [];
      const newStep: LessonContent =
        type === 'info'
          ? { type: 'info', text: 'New info text' }
          : {
              type: 'mcq',
              question: 'New Question?',
              options: ['Option 1', 'Option 2'],
              answer: 0,
            };
      return { ...prev, content: [...currentContent, newStep] };
    });
  };

  const removeStep = (index: number) => {
    setEditFormData((prev) => {
      const newContent = [...(prev.content || [])];
      newContent.splice(index, 1);
      return { ...prev, content: newContent };
    });
  };

  const updateStep = (index: number, updates: Partial<LessonContent>) => {
    setEditFormData((prev) => {
      const newContent = [...(prev.content || [])];
      newContent[index] = { ...newContent[index], ...updates };
      return { ...prev, content: newContent };
    });
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '20px' }}>
        <Skeleton height="80px" borderRadius="12px" style={{ marginBottom: '20px' }} />
        <Skeleton height="200px" borderRadius="12px" style={{ marginBottom: '20px' }} />
        <Skeleton height="200px" borderRadius="12px" style={{ marginBottom: '20px' }} />
      </div>
    );
  }

  return (
    <div className={styles.lessonsPageGrid}>
      {/* Sidebar: Topic Selector */}
      <div className={styles.topicsSidebar}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Select Topic</h3>
        <select
          className={styles.formSelect}
          value={selectedTopicId}
          onChange={(e) => setSelectedTopicId(e.target.value)}
        >
          <option value="">-- Choose a Topic --</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.chapter.course.title} &gt; {t.chapter.title} &gt; {t.title}
            </option>
          ))}
        </select>

        {selectedTopicId && (
          <button
            className={`${styles.actionBtn} ${styles.btnPrimary}`}
            style={{ marginTop: 'auto' }}
            onClick={handleAddLesson}
          >
            <Plus size={16} style={{ marginRight: '6px' }} />
            Add New Lesson
          </button>
        )}
      </div>

      {/* Main Area: Lessons List / Editor */}
      <div className={styles.lessonsWrapper}>
        {!selectedTopicId ? (
          <EmptyState
            icon={<BookOpen size={32} />}
            title="Select a Topic"
            description="Choose a topic from the sidebar to view and manage its lessons."
          />
        ) : lessons.length === 0 ? (
          <EmptyState
            icon={<List size={32} />}
            title="No Lessons Found"
            description="There are no lessons in this topic yet. Click 'Add New Lesson' to create one."
          />
        ) : (
          lessons.map((lesson) => (
            <div key={lesson.id} className={styles.lessonCard}>
              {editingLessonId === lesson.id ? (
                // EDIT MODE
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className={styles.lessonCardHeader}>
                    <input
                      className={styles.formInput}
                      value={editFormData.title || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      style={{ fontSize: '18px', fontWeight: 'bold' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className={`${styles.actionBtn} ${styles.btnSecondary}`}
                        onClick={() => setEditingLessonId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.btnPrimary}`}
                        onClick={saveEdit}
                      >
                        <Save size={14} style={{ marginRight: '4px' }} /> Save
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                      <label>Sort Order</label>
                      <input
                        className={styles.formInput}
                        type="number"
                        value={editFormData.order || ''}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, order: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                      <label>XP Reward</label>
                      <input
                        className={styles.formInput}
                        type="number"
                        value={editFormData.xpReward || ''}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, xpReward: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <hr style={{ borderColor: 'var(--color-border)' }} />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <h4 style={{ margin: 0 }}>Lesson Content Steps</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className={`${styles.actionBtn} ${styles.btnSecondary}`}
                        onClick={() => addStep('info')}
                      >
                        + Info Step
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.btnSecondary}`}
                        onClick={() => addStep('mcq')}
                      >
                        + MCQ Step
                      </button>
                    </div>
                  </div>

                  <div className={styles.stepsList}>
                    {(editFormData.content || []).map((step, idx) => (
                      <div key={idx} className={styles.stepItem}>
                        <div className={styles.stepHeader}>
                          <span
                            className={`${styles.stepBadge} ${step.type === 'info' ? styles.badgeInfo : styles.badgeMcq}`}
                          >
                            {step.type.toUpperCase()}
                          </span>
                          <button
                            className={`${styles.actionBtn} ${styles.btnDanger}`}
                            onClick={() => removeStep(idx)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {step.type === 'info' ? (
                          <textarea
                            className={styles.formInput}
                            rows={3}
                            value={step.text || ''}
                            onChange={(e) => updateStep(idx, { text: e.target.value })}
                            placeholder="Enter info text..."
                          />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input
                              className={styles.formInput}
                              value={step.question || ''}
                              onChange={(e) => updateStep(idx, { question: e.target.value })}
                              placeholder="Question text"
                            />

                            <div
                              style={{
                                paddingLeft: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                              }}
                            >
                              <label style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                                Options (Select radio to set correct answer)
                              </label>
                              {step.options?.map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                                >
                                  <input
                                    type="radio"
                                    name={`mcq-${idx}`}
                                    checked={step.answer === optIdx}
                                    onChange={() => updateStep(idx, { answer: optIdx })}
                                  />
                                  <input
                                    className={styles.formInput}
                                    style={{ flex: 1, padding: '8px' }}
                                    value={opt}
                                    onChange={(e) => {
                                      const newOptions = [...(step.options || [])];
                                      newOptions[optIdx] = e.target.value;
                                      updateStep(idx, { options: newOptions });
                                    }}
                                  />
                                  <button
                                    className={styles.actionBtn}
                                    style={{ padding: '8px' }}
                                    onClick={() => {
                                      const newOptions = [...(step.options || [])];
                                      newOptions.splice(optIdx, 1);
                                      updateStep(idx, { options: newOptions });
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                              <button
                                className={styles.actionBtn}
                                style={{
                                  alignSelf: 'flex-start',
                                  fontSize: '12px',
                                  padding: '4px 8px',
                                }}
                                onClick={() => {
                                  const newOptions = [
                                    ...(step.options || []),
                                    `Option ${(step.options?.length || 0) + 1}`,
                                  ];
                                  updateStep(idx, { options: newOptions });
                                }}
                              >
                                + Add Option
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <>
                  <div className={styles.lessonCardHeader}>
                    <h4>
                      {lesson.order}. {lesson.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span
                        className={styles.badge}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        +{lesson.xpReward} XP
                      </span>
                      <button
                        className={`${styles.actionBtn} ${styles.btnSecondary}`}
                        onClick={() => startEdit(lesson)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.btnDanger}`}
                        onClick={() => handleDeleteLesson(lesson.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.stepsList}>
                    {lesson.content?.map((step, idx) => (
                      <div key={idx} className={styles.stepItem} style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            className={`${styles.stepBadge} ${step.type === 'info' ? styles.badgeInfo : styles.badgeMcq}`}
                          >
                            {step.type.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '14px', color: 'var(--color-text-light)' }}>
                            {step.type === 'info'
                              ? step.text?.substring(0, 50) + '...'
                              : step.question}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
