'use client';
import { CheckCircle2, Clock, AlertCircle, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { Task, Project } from '@/lib/api';
import { isPast, parseISO, isToday } from 'date-fns';

interface DashboardProps {
  tasks: Task[];
  projects: Project[];
}

export default function Dashboard({ tasks, projects }: DashboardProps) {
  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'inprogress').length;
  const overdue = tasks.filter(t => t.dueDate && t.status !== 'done' && isPast(parseISO(t.dueDate))).length;
  const dueToday = tasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)) && t.status !== 'done').length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const recentTasks = [...tasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const getProject = (id: string) => projects.find(p => p.projectId === id);

  const stats = [
    { label: 'Completed', value: done, icon: CheckCircle2, color: 'var(--success)', bg: 'rgba(74,222,128,0.1)' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'var(--accent)', bg: 'var(--accent-soft)' },
    { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'var(--danger)', bg: 'rgba(249,112,102,0.1)' },
    { label: 'Due Today', value: dueToday, icon: Zap, color: 'var(--warning)', bg: 'rgba(251,146,60,0.1)' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Good morning, Demo 👋</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You have {inProgress} tasks in progress and {dueToday} due today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: bg, borderRadius: 10, padding: '0.65rem', display: 'flex' }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>{value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Progress */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BarChart3 size={16} color="var(--accent)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Overall Progress</span>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{done} of {tasks.length} tasks</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>{completion}%</span>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: 20, height: 8, overflow: 'hidden' }}>
              <div style={{ width: `${completion}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--success))', borderRadius: 20, transition: 'width 0.5s ease' }} />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            {projects.map(p => {
              const pTasks = tasks.filter(t => t.projectId === p.projectId);
              const pDone = pTasks.filter(t => t.status === 'done').length;
              const pPct = pTasks.length ? Math.round((pDone / pTasks.length) * 100) : 0;
              return (
                <div key={p.projectId} style={{ marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.name}</span>
                    <span style={{ fontSize: '0.78rem', color: p.color }}>{pPct}%</span>
                  </div>
                  <div style={{ background: 'var(--surface2)', borderRadius: 20, height: 4 }}>
                    <div style={{ width: `${pPct}%`, height: '100%', background: p.color, borderRadius: 20 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={16} color="var(--accent)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Recent Tasks</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentTasks.map(task => {
              const project = getProject(task.projectId);
              return (
                <div key={task.taskId} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: 8, background: 'var(--surface2)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: task.status === 'done' ? 'var(--success)' : task.status === 'inprogress' ? 'var(--accent)' : 'var(--text-muted)' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: task.status === 'done' ? 'line-through' : 'none', opacity: task.status === 'done' ? 0.6 : 1 }}>{task.title}</p>
                    {project && <p style={{ fontSize: '0.72rem', color: project.color }}>{project.name}</p>}
                  </div>
                  <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
