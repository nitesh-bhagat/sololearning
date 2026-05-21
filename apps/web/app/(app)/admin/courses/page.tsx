'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import styles from '../admin.module.css';
import { Skeleton, EmptyState } from '@sololearning/ui';
import { useToast } from '../../../../components/ToastProvider';

interface Topic {
  id: string;
  title: string;
  description: string | null;
  order: number;
  xpReward: number;
}

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  order: number;
  topics: Topic[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
}

interface Subject {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  courses: Course[];
}

type ModalType = 'subject' | 'course' | 'chapter' | 'topic';

interface ModalState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  type: ModalType;
  parentId?: string; // used for adds (subjectId, courseId, etc.)
  id?: string; // used for edits
  // Form fields
  title: string;
  description: string;
  icon?: string; // subject only
  order?: number; // chapter & topic only
  xpReward?: number; // topic only
}

export default function AdminCourses() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const toast = useToast();

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    mode: 'add',
    type: 'subject',
    title: '',
    description: '',
    icon: '',
    order: 1,
    xpReward: 50,
  });

  const fetchTree = async () => {
    try {
      const res = await fetch('/api/admin/course-tree', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (err) {
      toast.error('Network error fetching course tree');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Open Modal Helpers
  const openAddModal = (type: ModalType, parentId?: string) => {
    setModal({
      isOpen: true,
      mode: 'add',
      type,
      parentId,
      title: '',
      description: '',
      icon: '',
      order: 1,
      xpReward: 50,
    });
  };

  const openEditModal = (type: ModalType, item: any) => {
    setModal({
      isOpen: true,
      mode: 'edit',
      type,
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      icon: item.icon || '',
      order: item.order || 1,
      xpReward: item.xpReward || 50,
    });
  };

  // Delete Action
  const handleDelete = async (type: ModalType, id: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${type}? This will delete all child nodes permanently.`,
      )
    ) {
      return;
    }

    let url = '';
    if (type === 'subject') url = `/api/admin/subjects/${id}`;
    if (type === 'course') url = `/api/admin/courses/${id}`;
    if (type === 'chapter') url = `/api/admin/chapters/${id}`;
    if (type === 'topic') url = `/api/admin/topics/${id}`;

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success(`${type} deleted successfully`);
        fetchTree();
      } else {
        toast.error(`Failed to delete ${type}`);
      }
    } catch (err) {
      toast.error(`Network error deleting ${type}`);
    }
  };

  // Save/Submit Form Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { mode, type, id, parentId, title, description, icon, order, xpReward } = modal;

    let url = '';
    let method = 'POST';
    const payload: any = {};

    // Configure endpoints and bodies
    if (type === 'subject') {
      url = mode === 'add' ? '/api/admin/subjects' : `/api/admin/subjects/${id}`;
      method = mode === 'add' ? 'POST' : 'PUT';
      Object.assign(payload, { title, description, icon });
    } else if (type === 'course') {
      url = mode === 'add' ? '/api/admin/courses' : `/api/admin/courses/${id}`;
      method = mode === 'add' ? 'POST' : 'PUT';
      Object.assign(payload, { title, description, subjectId: parentId });
    } else if (type === 'chapter') {
      url = mode === 'add' ? '/api/admin/chapters' : `/api/admin/chapters/${id}`;
      method = mode === 'add' ? 'POST' : 'PUT';
      Object.assign(payload, { title, description, order: Number(order), courseId: parentId });
    } else if (type === 'topic') {
      url = mode === 'add' ? '/api/admin/topics' : `/api/admin/topics/${id}`;
      method = mode === 'add' ? 'POST' : 'PUT';
      Object.assign(payload, {
        title,
        description,
        order: Number(order),
        xpReward: Number(xpReward),
        chapterId: parentId,
      });
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (res.ok) {
        toast.success(`${type} saved successfully`);
        setModal((prev) => ({ ...prev, isOpen: false }));
        fetchTree();
      } else {
        const errData = await res.json();
        toast.error(errData.error || `Failed to save ${type}`);
      }
    } catch (err) {
      toast.error(`Network error saving ${type}`);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '20px' }}>
        <Skeleton height="40px" borderRadius="8px" style={{ marginBottom: '10px' }} />
        <Skeleton
          height="40px"
          borderRadius="8px"
          style={{ marginBottom: '10px', width: '80%', marginLeft: '20px' }}
        />
        <Skeleton
          height="40px"
          borderRadius="8px"
          style={{ marginBottom: '10px', width: '60%', marginLeft: '40px' }}
        />
        <Skeleton
          height="40px"
          borderRadius="8px"
          style={{ marginBottom: '10px', width: '40%', marginLeft: '60px' }}
        />
      </div>
    );
  }

  return (
    <div className={styles.treeContainer}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button
          className={`${styles.actionBtn} ${styles.btnPrimary}`}
          onClick={() => openAddModal('subject')}
        >
          <Plus size={16} style={{ marginRight: '6px' }} />
          Add Subject
        </button>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={<Folder size={32} />}
          title="No Subjects Yet"
          description="Click 'Add Subject' to start building your course hierarchy."
        />
      ) : (
        subjects.map((sub) => {
          const isSubExpanded = expandedNodes[sub.id];
          return (
            <div className={styles.treeNode} key={sub.id}>
              {/* SUBJECT NODE */}
              <div className={styles.nodeHeader} onClick={() => toggleExpand(sub.id)}>
                <div className={styles.nodeTitleInfo}>
                  {isSubExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span className={styles.nodeIcon}>{sub.icon || '📚'}</span>
                  <span className={styles.nodeLabel}>{sub.title}</span>
                  <span style={{ color: 'var(--color-text-light)', fontSize: '13px' }}>
                    ({sub.courses.length} courses)
                  </span>
                </div>
                <div className={styles.nodeActions} onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`${styles.actionBtn} ${styles.btnSecondary}`}
                    onClick={() => openEditModal('subject', sub)}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.btnDanger}`}
                    onClick={() => handleDelete('subject', sub.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* SUBJECT CHILDREN (COURSES) */}
              {isSubExpanded && (
                <div className={styles.nodeChildren}>
                  {sub.courses.map((course) => {
                    const isCourseExpanded = expandedNodes[course.id];
                    return (
                      <div className={styles.courseChild} key={course.id}>
                        <div className={styles.nodeHeader} onClick={() => toggleExpand(course.id)}>
                          <div className={styles.nodeTitleInfo}>
                            {isCourseExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                            <span className={styles.nodeLabel} style={{ fontSize: '15px' }}>
                              {course.title}
                            </span>
                          </div>
                          <div className={styles.nodeActions} onClick={(e) => e.stopPropagation()}>
                            <button
                              className={`${styles.actionBtn} ${styles.btnSecondary}`}
                              onClick={() => openEditModal('course', course)}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.btnDanger}`}
                              onClick={() => handleDelete('course', course.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* COURSE CHILDREN (CHAPTERS) */}
                        {isCourseExpanded && (
                          <div
                            className={styles.nodeChildren}
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
                          >
                            {course.chapters.map((chapter) => {
                              const isChapterExpanded = expandedNodes[chapter.id];
                              return (
                                <div className={styles.chapterChild} key={chapter.id}>
                                  <div
                                    className={styles.nodeHeader}
                                    onClick={() => toggleExpand(chapter.id)}
                                  >
                                    <div className={styles.nodeTitleInfo}>
                                      {isChapterExpanded ? (
                                        <ChevronDown size={14} />
                                      ) : (
                                        <ChevronRight size={14} />
                                      )}
                                      <span
                                        style={{ color: 'var(--color-primary)', fontWeight: '600' }}
                                      >
                                        Ch {chapter.order}.
                                      </span>
                                      <span
                                        className={styles.nodeLabel}
                                        style={{ fontSize: '14px' }}
                                      >
                                        {chapter.title}
                                      </span>
                                    </div>
                                    <div
                                      className={styles.nodeActions}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        className={`${styles.actionBtn} ${styles.btnSecondary}`}
                                        onClick={() => openEditModal('chapter', chapter)}
                                      >
                                        <Edit2 size={13} />
                                      </button>
                                      <button
                                        className={`${styles.actionBtn} ${styles.btnDanger}`}
                                        onClick={() => handleDelete('chapter', chapter.id)}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* CHAPTER CHILDREN (TOPICS) */}
                                  {isChapterExpanded && (
                                    <div
                                      className={styles.nodeChildren}
                                      style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                                    >
                                      {chapter.topics.map((topic) => (
                                        <div className={styles.topicChild} key={topic.id}>
                                          <div
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '10px',
                                            }}
                                          >
                                            <span style={{ color: '#818cf8', fontWeight: '500' }}>
                                              #{topic.order}
                                            </span>
                                            <span>{topic.title}</span>
                                            <span className={styles.badge}>
                                              +{topic.xpReward} XP
                                            </span>
                                          </div>
                                          <div className={styles.nodeActions}>
                                            <button
                                              className={`${styles.actionBtn} ${styles.btnSecondary}`}
                                              onClick={() => openEditModal('topic', topic)}
                                            >
                                              <Edit2 size={12} />
                                            </button>
                                            <button
                                              className={`${styles.actionBtn} ${styles.btnDanger}`}
                                              onClick={() => handleDelete('topic', topic.id)}
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        </div>
                                      ))}

                                      <button
                                        className={styles.addChildBtn}
                                        onClick={() => openAddModal('topic', chapter.id)}
                                      >
                                        <Plus size={14} />
                                        Add Topic
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            <button
                              className={styles.addChildBtn}
                              onClick={() => openAddModal('chapter', course.id)}
                            >
                              <Plus size={14} />
                              Add Chapter
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button
                    className={styles.addChildBtn}
                    onClick={() => openAddModal('course', sub.id)}
                  >
                    <Plus size={14} />
                    Add Course
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ADD/EDIT MODAL OVERLAY */}
      {modal.isOpen && (
        <div className={styles.modalOverlay}>
          <form className={styles.modalContent} onSubmit={handleSubmit}>
            <div className={styles.modalHeader}>
              <h3>
                {modal.mode === 'add' ? 'Add' : 'Edit'}{' '}
                {modal.type.charAt(0).toUpperCase() + modal.type.slice(1)}
              </h3>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.btnSecondary}`}
                onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Close
              </button>
            </div>

            {/* Common fields */}
            <div className={styles.formGroup}>
              <label>Title</label>
              <input
                className={styles.formInput}
                type="text"
                value={modal.title}
                onChange={(e) => setModal((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                className={styles.formInput}
                rows={3}
                value={modal.description}
                onChange={(e) => setModal((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Subject Specific */}
            {modal.type === 'subject' && (
              <div className={styles.formGroup}>
                <label>Emoji Icon</label>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder="e.g. 🐍, ☕"
                  value={modal.icon}
                  onChange={(e) => setModal((prev) => ({ ...prev, icon: e.target.value }))}
                />
              </div>
            )}

            {/* Chapter & Topic Specific */}
            {(modal.type === 'chapter' || modal.type === 'topic') && (
              <div className={styles.formGroup}>
                <label>Sort Order Number</label>
                <input
                  className={styles.formInput}
                  type="number"
                  value={modal.order}
                  onChange={(e) => setModal((prev) => ({ ...prev, order: Number(e.target.value) }))}
                  required
                />
              </div>
            )}

            {/* Topic Specific */}
            {modal.type === 'topic' && (
              <div className={styles.formGroup}>
                <label>XP Reward amount</label>
                <input
                  className={styles.formInput}
                  type="number"
                  value={modal.xpReward}
                  onChange={(e) =>
                    setModal((prev) => ({ ...prev, xpReward: Number(e.target.value) }))
                  }
                  required
                />
              </div>
            )}

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.btnSecondary}`}
                onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </button>
              <button type="submit" className={`${styles.actionBtn} ${styles.btnPrimary}`}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
