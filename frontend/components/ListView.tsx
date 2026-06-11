'use client';
import { useState } from 'react';
import { Trash2, Edit2, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Task, Project } from '@/lib/api';
import { format, parseISO, isPast } from 'date-fns';

interface ListViewProps {
  tasks: Task[];
  projects: Project[];
  activeProjectId: string | null;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

type SortKey = 'title' | 'priority' | 'status' | 'dueDate';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const STATUS_ORDER = { inprogress: 0, todo: 1, done: 2 };

export default function ListView({ tasks, projects, activeProjectId, onUpdate, onDelete }: ListViewProps) {
  const [sort, setSort] = useState<SortKey>('priority');
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const getProject = (id: string) => projects.find(p => p.projectId === id);

  const filtered = tasks
    .filter(t => activeProjectId ? t.projectId === activeProjectId : true)
    .filter(t => t.title.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      let cmp = 0;
      if (sort === 'title') cmp = a.title.localeCompare(b.title);
      else if (sort === 'priority') cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      else if (sort === 'status') cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      else if (sort === 'dueDate') cmp = (a.dueDate || '').localeCompare(b.dueDate || '');
      return sortAsc ? cmp : -cmp;
    });

  const handleSort = (key: SortKey) => {
    if (sort === key) setSortAsc(!sortAsc);
    else { setSort(key); setSortAsc(true); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => sort === k
    ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
    : <ChevronUp size={12} style={{ opacity: 0.2 }} />;

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input className="input" placeholder="Search tasks..." value={filter} onChange={e => setFilter(e.target.value)} style={{ maxWidth: 320 }} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="list-scroll">
        {/* Header */}
        <div className="list-row" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
          {([['title', 'Task'], ['status', 'Status'], ['priority', 'Priority'], ['dueDate', 'Due Date']] as [SortKey, string][]).map(([k, label]) => (
            <button key={k} onClick={() => handleSort(k)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.3rem', textAlign: 'left' }}>
              {label} <SortIcon k={k} />
            </button>
          ))}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No tasks found</div>
        ) : filtered.map((task, i) => {
          const project = getProject(task.projectId);
          const overdue = task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate));
          return (
            <div key={task.taskId} className="list-row" style={{ padding: '0.75rem 1rem', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              
              <div style={{ overflow: 'hidden' }}>
                {editId === task.taskId ? (
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <input className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.85rem' }}
                      onKeyDown={e => { if (e.key === 'Enter') { onUpdate(task.taskId, { title: editTitle }); setEditId(null); } if (e.key === 'Escape') setEditId(null); }} autoFocus />
                    <button onClick={() => { onUpdate(task.taskId, { title: editTitle }); setEditId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)' }}><Check size={14} /></button>
                    <button onClick={() => setEditId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={14} /></button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: task.status === 'done' ? 'line-through' : 'none', opacity: task.status === 'done' ? 0.5 : 1 }}>{task.title}</p>
                    {project && <span style={{ fontSize: '0.72rem', color: project.color }}>{project.name}</span>}
                  </div>
                )}
              </div>

              <div>
                <select value={task.status} onChange={e => onUpdate(task.taskId, { status: e.target.value as Task['status'] })}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 6, padding: '0.25rem 0.4rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div><span className={`badge badge-${task.priority}`}>{task.priority}</span></div>

              <div style={{ fontSize: '0.82rem', color: overdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                {task.dueDate ? format(parseISO(task.dueDate), 'MMM d, yyyy') : '—'}
              </div>

              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button onClick={() => { setEditId(task.taskId); setEditTitle(task.title); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 4 }}><Edit2 size={13} /></button>
                <button onClick={() => onDelete(task.taskId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', opacity: 0.7, padding: 4, borderRadius: 4 }}><Trash2 size={13} /></button>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
