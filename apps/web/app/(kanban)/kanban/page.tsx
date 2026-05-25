'use client';

import React, { useState, useEffect, DragEvent } from 'react';
import Link from 'next/link';
import { Plus, X, GripVertical, ChevronLeft } from 'lucide-react';
import { useToast } from '../../../components/ToastProvider';

// --- Types ---
type Task = {
  id: string;
  title: string;
  description?: string;
  columnId: string;
};

type Column = {
  id: string;
  title: string;
};

// --- Default State ---
const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const DEFAULT_TASKS: Task[] = [
  { id: 't1', title: 'Learn React', columnId: 'todo' },
  { id: 't2', title: 'Build a Kanban Board', columnId: 'in-progress' },
  { id: 't3', title: 'Setup Next.js', columnId: 'done' },
];

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const toast = useToast();

  // --- Add Task Modal State ---
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null); // holds columnId
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // --- Load & Save State ---
  useEffect(() => {
    const savedColumns = localStorage.getItem('kanban_columns');
    const savedTasks = localStorage.getItem('kanban_tasks');

    if (savedColumns && savedTasks) {
      try {
        setColumns(JSON.parse(savedColumns));
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        setColumns(DEFAULT_COLUMNS);
        setTasks(DEFAULT_TASKS);
      }
    } else {
      setColumns(DEFAULT_COLUMNS);
      setTasks(DEFAULT_TASKS);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('kanban_columns', JSON.stringify(columns));
      localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
    }
  }, [columns, tasks, isLoaded]);

  // --- Actions ---
  const handleAddTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      columnId,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsAddingTask(null);
    toast.success('Task added!');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    toast.success('Task removed');
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag ghost to generate before changing opacity
    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    const droppedTaskId = e.dataTransfer.getData('taskId');

    if (droppedTaskId) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === droppedTaskId ? { ...task, columnId } : task)),
      );
    }
  };

  if (!isLoaded)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-light hover:text-text transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-bold text-sm uppercase tracking-wider">Back to App</span>
          </Link>
          <div className="w-px h-6 bg-border mx-2"></div>
          <h1 className="text-xl font-black text-text">Project Kanban</h1>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        <div className="flex items-start gap-6 h-full min-w-max pb-4">
          {columns.map((column) => {
            const columnTasks = tasks.filter((t) => t.columnId === column.id);

            return (
              <div
                key={column.id}
                className="w-80 h-full flex flex-col bg-surface/50 border border-border rounded-2xl shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className="p-4 flex items-center justify-between border-b border-border/50 bg-surface/80 backdrop-blur-md rounded-t-2xl">
                  <h2 className="font-bold text-text flex items-center gap-2">
                    {column.title}
                    <span className="bg-border/50 text-text-light text-xs py-0.5 px-2 rounded-full font-bold">
                      {columnTasks.length}
                    </span>
                  </h2>
                </div>

                {/* Column Body (Tasks list) */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className="bg-surface border border-border p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group relative"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical
                          size={16}
                          className="text-text-light/50 shrink-0 mt-1 cursor-grab"
                        />
                        <span className="text-sm font-semibold text-text leading-snug pr-6">
                          {task.title}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="absolute top-3 right-3 text-text-light hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete task"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  {/* Add Task Area */}
                  {isAddingTask === column.id ? (
                    <div className="bg-surface border border-primary/50 p-3 rounded-xl shadow-sm mt-2">
                      <input
                        autoFocus
                        type="text"
                        placeholder="What needs to be done?"
                        className="w-full bg-transparent text-sm text-text outline-none mb-3 placeholder:text-text-light/50 font-semibold"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTask(column.id);
                          if (e.key === 'Escape') {
                            setIsAddingTask(null);
                            setNewTaskTitle('');
                          }
                        }}
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => {
                            setIsAddingTask(null);
                            setNewTaskTitle('');
                          }}
                          className="text-xs font-bold text-text-light hover:text-text px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddTask(column.id)}
                          className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors"
                        >
                          Add Task
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingTask(column.id)}
                      className="flex items-center gap-2 text-text-light hover:text-text hover:bg-white/5 p-3 rounded-xl transition-colors font-semibold text-sm mt-1 w-full"
                    >
                      <Plus size={18} />
                      Add Task
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
