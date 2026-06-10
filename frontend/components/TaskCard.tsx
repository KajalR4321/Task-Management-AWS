'use client';
import { useState } from 'react';
import { Trash2, Paperclip, Calendar, Edit2, Check, X } from 'lucide-react';
import { Task, Project } from '@/lib/api';
import { format, isPast, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, project, onUpdate, onDelete }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const isOverdue = task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate));

  const handleSave = () => {
    if (title.trim() && title !== task.title) onUpdate(task.taskId, { title: title.trim() });
    setEditing(false);
  };

  return (
    <div className="card fade-in" style={{ padding: '0.875rem', cursor: 'grab', userSelect: 'none', marginBottom: 8 }}
      onMouseDown={e => { if ((e.target as HTMLElement).closest('button, input')) e.stopPropagation(); }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <div style={{ flex: 1 }}>
          {editing ? (
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
                autoFocus style={{ fontSize: '0.85rem', padding: '0.3rem 0.5rem' }} />
              <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}><Check size={14} /></button>
              <button onClick={() => { setEditing(false); setTitle(task.title); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={14} /></button>
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, textDecoration: task.status === 'done' ? 'line-through' : 'none', opacity: task.status === 'done' ? 0.6 : 1 }}>{task.title}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
          <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: 0.6, padding: 2 }} title="Edit">
            <Edit2 size={12} />
          </button>
          <button onClick={() => onDelete(task.taskId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', opacity: 0.6, padding: 2 }} title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem', lineHeight: 1.4 }}>{task.description}</p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          {project && (
            <span className="badge" style={{ background: `${project.color}18`, color: project.color }}>{project.name}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {task.attachmentUrl && <Paperclip size={12} color="var(--text-muted)" />}
          {task.dueDate && (
            <span style={{ fontSize: '0.72rem', color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Calendar size={11} />
              {format(parseISO(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
