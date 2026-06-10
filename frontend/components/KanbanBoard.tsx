'use client';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Task, Project } from '@/lib/api';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  activeProjectId: string | null;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onCreate: (task: Omit<Task, 'taskId' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
}

const COLUMNS: { id: Task['status']; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'var(--text-muted)' },
  { id: 'inprogress', label: 'In Progress', color: 'var(--accent)' },
  { id: 'done', label: 'Done', color: 'var(--success)' },
];

export default function KanbanBoard({ tasks, projects, activeProjectId, onUpdate, onDelete, onCreate }: KanbanBoardProps) {
  const [showModal, setShowModal] = useState<Task['status'] | null>(null);

  const filteredTasks = activeProjectId ? tasks.filter(t => t.projectId === activeProjectId) : tasks;

  const getColumnTasks = (status: Task['status']) => filteredTasks.filter(t => t.status === status);

  const getProject = (projectId: string) => projects.find(p => p.projectId === projectId);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as Task['status'];
    const taskId = result.draggableId;
    const task = tasks.find(t => t.taskId === taskId);
    if (task && task.status !== newStatus) onUpdate(taskId, { status: newStatus });
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', height: '100%', alignItems: 'start' }}>
          {COLUMNS.map(col => {
            const colTasks = getColumnTasks(col.id);
            return (
              <div key={col.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                {/* Column Header */}
                <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{col.label}</span>
                    <span style={{ fontSize: '0.75rem', background: 'var(--surface2)', color: 'var(--text-muted)', borderRadius: 20, padding: '0.1rem 0.5rem', fontWeight: 500 }}>{colTasks.length}</span>
                  </div>
                  <button onClick={() => setShowModal(col.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', borderRadius: 6, padding: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    <Plus size={16} />
                  </button>
                </div>

                {/* Droppable */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      style={{ padding: '0.75rem', minHeight: 120, background: snapshot.isDraggingOver ? 'var(--accent-soft)' : 'transparent', transition: 'background 0.15s' }}>
                      {colTasks.map((task, idx) => (
                        <Draggable key={task.taskId} draggableId={task.taskId} index={idx}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                              style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.85 : 1, transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} rotate(2deg)` : provided.draggableProps.style?.transform }}>
                              <TaskCard task={task} project={getProject(task.projectId)} onUpdate={onUpdate} onDelete={onDelete} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {colTasks.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {showModal && (
        <TaskModal projects={projects} defaultStatus={showModal} defaultProjectId={activeProjectId || undefined}
          onClose={() => setShowModal(null)} onCreate={onCreate} />
      )}
    </>
  );
}
