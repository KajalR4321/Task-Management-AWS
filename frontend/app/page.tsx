'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import KanbanBoard from '@/components/KanbanBoard';
import ListView from '@/components/ListView';
import Dashboard from '@/components/Dashboard';
import TaskModal from '@/components/TaskModal';
import { Task, Project, api, demoTasks, demoProjects } from '@/lib/api';

const DEMO_MODE = !process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [activeView, setActiveView] = useState('dashboard');
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  const loadData = useCallback(async () => {
    if (DEMO_MODE) return;
    try {
      setLoading(true);
      const [t, p] = await Promise.all([api.getTasks(), api.getProjects()]);
      setTasks(t);
      setProjects(p);
      setIsDemo(false);
    } catch { setIsDemo(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // CRUD handlers with optimistic updates
  const handleCreateTask = async (taskData: Omit<Task, 'taskId' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const optimistic: Task = { ...taskData, taskId: `tmp-${Date.now()}`, userId: 'demo', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setTasks(prev => [optimistic, ...prev]);
    if (!isDemo) {
      try { const real = await api.createTask(taskData); setTasks(prev => prev.map(t => t.taskId === optimistic.taskId ? real : t)); }
      catch { setTasks(prev => prev.filter(t => t.taskId !== optimistic.taskId)); }
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t));
    if (!isDemo) { try { await api.updateTask(taskId, updates); } catch { await loadData(); } }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.taskId !== taskId));
    if (!isDemo) { try { await api.deleteTask(taskId); } catch { await loadData(); } }
  };

  const handleCreateProject = async (name: string, color: string) => {
    const optimistic: Project = { projectId: `tmp-${Date.now()}`, userId: 'demo', name, color, createdAt: new Date().toISOString() };
    setProjects(prev => [...prev, optimistic]);
    if (!isDemo) {
      try { const real = await api.createProject({ name, color }); setProjects(prev => prev.map(p => p.projectId === optimistic.projectId ? real : p)); }
      catch { setProjects(prev => prev.filter(p => p.projectId !== optimistic.projectId)); }
    }
  };

  const filteredTasks = activeProject ? tasks.filter(t => t.projectId === activeProject) : tasks;
  const activeProjectObj = projects.find(p => p.projectId === activeProject);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar projects={projects} activeProject={activeProject} activeView={activeView}
        onProjectSelect={setActiveProject} onViewChange={setActiveView} onCreateProject={handleCreateProject} />

      {/* Main Content */}
      <main style={{ marginLeft: 240, flex: 1, padding: '2rem', minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'board' && (activeProjectObj ? activeProjectObj.name : 'All Tasks — Board')}
              {activeView === 'list' && (activeProjectObj ? activeProjectObj.name : 'All Tasks — List')}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {filteredTasks.length} tasks · {filteredTasks.filter(t => t.status === 'done').length} completed
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Demo/Live Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.7rem', borderRadius: 20, background: isDemo ? 'rgba(251,146,60,0.1)' : 'rgba(74,222,128,0.1)', border: `1px solid ${isDemo ? 'rgba(251,146,60,0.3)' : 'rgba(74,222,128,0.3)'}` }}>
              {isDemo ? <WifiOff size={12} color="var(--warning)" /> : <Wifi size={12} color="var(--success)" />}
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isDemo ? 'var(--warning)' : 'var(--success)' }}>{isDemo ? 'DEMO MODE' : 'LIVE'}</span>
            </div>
            {!DEMO_MODE && (
              <button className="btn-ghost" onClick={loadData} disabled={loading}>
                <RefreshCw size={14} className={loading ? 'spinner' : ''} />
              </button>
            )}
            {activeView !== 'dashboard' && (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} /> New Task
              </button>
            )}
          </div>
        </div>

        {/* Views */}
        {activeView === 'dashboard' && <Dashboard tasks={tasks} projects={projects} />}
        {activeView === 'board' && (
          <KanbanBoard tasks={tasks} projects={projects} activeProjectId={activeProject}
            onUpdate={handleUpdateTask} onDelete={handleDeleteTask} onCreate={handleCreateTask} />
        )}
        {activeView === 'list' && (
          <ListView tasks={tasks} projects={projects} activeProjectId={activeProject}
            onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />
        )}
      </main>

      {showModal && (
        <TaskModal projects={projects} defaultProjectId={activeProject || undefined}
          onClose={() => setShowModal(false)} onCreate={handleCreateTask} />
      )}
    </div>
  );
}
