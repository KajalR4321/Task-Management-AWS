'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Wifi, WifiOff, Menu } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const loadData = useCallback(async () => {
    if (DEMO_MODE) return;
    try {
      setLoading(true);
      const [t, p] = await Promise.all([api.getTasks(), api.getProjects()]);
      setTasks(t); setProjects(p); setIsDemo(false);
    } catch { setIsDemo(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

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
  const sidebarVisible = isMobile ? sidebarOpen : true;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar projects={projects} activeProject={activeProject} activeView={activeView}
        onProjectSelect={setActiveProject} onViewChange={setActiveView}
        onCreateProject={handleCreateProject} userName="Demo User"
        isOpen={sidebarVisible} onClose={isMobile ? () => setSidebarOpen(false) : undefined} />

      <main style={{ marginLeft: isMobile ? 0 : 240, flex: 1, padding: isMobile ? '1rem' : '2rem', minHeight: '100vh', transition: 'margin-left 0.25s ease' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', display: 'flex', padding: '0.4rem', borderRadius: 8 }}>
                <Menu size={18} />
              </button>
            )}
            <div>
              <h2 style={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700 }}>
                {activeView === 'dashboard' && 'Dashboard'}
                {activeView === 'board' && (activeProjectObj ? activeProjectObj.name : 'All Tasks')}
                {activeView === 'list' && (activeProjectObj ? activeProjectObj.name : 'All Tasks')}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {filteredTasks.length} tasks · {filteredTasks.filter(t => t.status === 'done').length} completed
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.7rem', borderRadius: 20, background: isDemo ? 'rgba(251,146,60,0.1)' : 'rgba(74,222,128,0.1)', border: `1px solid ${isDemo ? 'rgba(251,146,60,0.3)' : 'rgba(74,222,128,0.3)'}` }}>
              {isDemo ? <WifiOff size={12} color="var(--warning)" /> : <Wifi size={12} color="var(--success)" />}
              {!isMobile && <span style={{ fontSize: '0.72rem', fontWeight: 600, color: isDemo ? 'var(--warning)' : 'var(--success)' }}>{isDemo ? 'DEMO' : 'LIVE'}</span>}
            </div>
            {!DEMO_MODE && (
              <button className="btn-ghost" onClick={loadData} disabled={loading} style={{ padding: '0.45rem' }}>
                <RefreshCw size={14} className={loading ? 'spinner' : ''} />
              </button>
            )}
            {activeView !== 'dashboard' && (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} />
                {!isMobile && ' New Task'}
              </button>
            )}
          </div>
        </div>

        {activeView === 'dashboard' && <Dashboard tasks={tasks} projects={projects} userName="Demo User" />}
        {activeView === 'board' && <KanbanBoard tasks={tasks} projects={projects} activeProjectId={activeProject} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} onCreate={handleCreateTask} />}
        {activeView === 'list' && <ListView tasks={tasks} projects={projects} activeProjectId={activeProject} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />}
      </main>

      {showModal && (
        <TaskModal projects={projects} defaultProjectId={activeProject || undefined}
          onClose={() => setShowModal(false)} onCreate={handleCreateTask} />
      )}
    </div>
  );
}