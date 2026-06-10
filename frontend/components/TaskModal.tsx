'use client';
import { useState } from 'react';
import { X, Calendar, Flag, FolderOpen, Upload } from 'lucide-react';
import { Task, Project, api } from '@/lib/api';

interface TaskModalProps {
  projects: Project[];
  onClose: () => void;
  onCreate: (task: Omit<Task, 'taskId' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  defaultProjectId?: string;
  defaultStatus?: Task['status'];
}

export default function TaskModal({ projects, onClose, onCreate, defaultProjectId, defaultStatus }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>(defaultStatus || 'todo');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.projectId || '');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    let attachmentUrl = '';
    if (file) {
      try {
        setUploading(true);
        const { uploadUrl, fileUrl } = await api.getUploadUrl(file.name, file.type);
        await api.uploadFile(uploadUrl, file);
        attachmentUrl = fileUrl;
      } catch { /* demo mode: skip upload */ }
      finally { setUploading(false); }
    }
    onCreate({ title: title.trim(), description, status, priority, dueDate, projectId, ...(attachmentUrl && { attachmentUrl }) });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 480, padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>New Task</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Title *</label>
            <input className="input" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Description</label>
            <textarea className="input" placeholder="Add details..." value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Flag size={12} />Priority</label>
              <select className="input" value={priority} onChange={e => setPriority(e.target.value as Task['priority'])}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={12} />Due Date</label>
              <input className="input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FolderOpen size={12} />Project</label>
              <select className="input" value={projectId} onChange={e => setProjectId(e.target.value)}>
                {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>Status</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value as Task['status'])}>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Upload size={12} />Attachment (S3)</label>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={uploading || !title.trim()}>
              {uploading ? 'Uploading...' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
