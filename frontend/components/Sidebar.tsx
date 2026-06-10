'use client';
import { useState } from 'react';
import { LayoutDashboard, Kanban, List, FolderOpen, Plus, CheckSquare, X } from 'lucide-react';
import { Project } from '@/lib/api';

interface SidebarProps {
  projects: Project[];
  activeProject: string | null;
  activeView: string;
  onProjectSelect: (id: string | null) => void;
  onViewChange: (view: string) => void;
  onCreateProject: (name: string, color: string) => void;
}

const COLORS = ['#7c6af7','#4ade80','#fb923c','#f97066','#38bdf8','#e879f9','#fbbf24'];

export default function Sidebar({ projects, activeProject, activeView, onProjectSelect, onViewChange, onCreateProject }: SidebarProps) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateProject(newName.trim(), newColor);
    setNewName('');
    setNewColor(COLORS[0]);
    setShowNewProject(false);
  };

  return (
    <aside style={{ width: 240, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
      {/* Logo */}
      <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ background: 'var(--accent)', borderRadius: 8, padding: '0.4rem', display: 'flex' }}>
            <CheckSquare size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>TaskFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0.75rem 0.75rem 0' }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'board', label: 'Board View', icon: Kanban },
          { id: 'list', label: 'List View', icon: List },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { onViewChange(id); onProjectSelect(null); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, marginBottom: 2,
              background: activeView === id && !activeProject ? 'var(--accent-soft)' : 'transparent',
              color: activeView === id && !activeProject ? 'var(--accent)' : 'var(--text-muted)',
            }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      {/* Projects */}
      <div style={{ padding: '1rem 0.75rem 0', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Projects</span>
          <button onClick={() => setShowNewProject(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <Plus size={14} />
          </button>
        </div>

        {projects.map(p => (
          <button key={p.projectId} onClick={() => { onProjectSelect(p.projectId); onViewChange('board'); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.85rem', marginBottom: 2,
              background: activeProject === p.projectId ? 'var(--accent-soft)' : 'transparent',
              color: activeProject === p.projectId ? 'var(--accent)' : 'var(--text-muted)',
            }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <FolderOpen size={14} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
          </button>
        ))}

        {showNewProject && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem', marginTop: '0.5rem' }}>
            <input className="input" placeholder="Project name" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()} style={{ marginBottom: '0.5rem' }} autoFocus />
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: newColor === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn-primary" onClick={handleCreate} style={{ flex: 1, justifyContent: 'center' }}>Create</button>
              <button className="btn-ghost" onClick={() => setShowNewProject(false)}><X size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>D</div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>Kajal Rajak</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kajal@taskflow.app</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
