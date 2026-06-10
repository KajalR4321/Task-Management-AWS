const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://your-api-gateway-url.amazonaws.com/prod';

export interface Task {
  taskId: string;
  userId: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  projectId: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

const headers = () => ({
  'Content-Type': 'application/json',
  'x-user-id': 'demo-user-001', // Replace with Cognito JWT in production
});

export const api = {
  // Tasks
  getTasks: async (projectId?: string): Promise<Task[]> => {
    const url = projectId
      ? `${API_BASE}/tasks?projectId=${projectId}`
      : `${API_BASE}/tasks`;
    const res = await fetch(url, { headers: headers(), next: { revalidate: 0 } });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  createTask: async (task: Omit<Task, 'taskId' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  deleteTask: async (taskId: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const res = await fetch(`${API_BASE}/projects`, { headers: headers(), next: { revalidate: 0 } });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  createProject: async (project: { name: string; color: string }): Promise<Project> => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  // S3 Upload
  getUploadUrl: async (fileName: string, fileType: string): Promise<{ uploadUrl: string; fileUrl: string }> => {
    const res = await fetch(`${API_BASE}/upload-url`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fileName, fileType }),
    });
    if (!res.ok) throw new Error('Failed to get upload URL');
    return res.json();
  },

  uploadFile: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
  },
};

// Demo data for when API is not configured
export const demoTasks: Task[] = [
  { taskId: '1', userId: 'demo', projectId: 'p1', title: 'Design system setup', description: 'Create color tokens and component library', status: 'done', priority: 'high', dueDate: '2025-06-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { taskId: '2', userId: 'demo', projectId: 'p1', title: 'Build Kanban board', description: 'Implement drag and drop functionality', status: 'inprogress', priority: 'high', dueDate: '2025-06-10', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { taskId: '3', userId: 'demo', projectId: 'p1', title: 'Lambda API integration', description: 'Connect frontend to AWS Lambda endpoints', status: 'inprogress', priority: 'medium', dueDate: '2025-06-12', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { taskId: '4', userId: 'demo', projectId: 'p2', title: 'Setup DynamoDB tables', description: 'Single-table design for all entities', status: 'done', priority: 'high', dueDate: '2025-05-28', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { taskId: '5', userId: 'demo', projectId: 'p2', title: 'Deploy to AWS Amplify', description: 'Setup CI/CD pipeline with GitHub', status: 'todo', priority: 'medium', dueDate: '2025-06-15', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { taskId: '6', userId: 'demo', projectId: 'p1', title: 'Write documentation', description: 'API docs and deployment guide', status: 'todo', priority: 'low', dueDate: '2025-06-20', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { taskId: '7', userId: 'demo', projectId: 'p2', title: 'Performance optimization', description: 'Lighthouse score > 95', status: 'todo', priority: 'medium', dueDate: '2025-06-18', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const demoProjects: Project[] = [
  { projectId: 'p1', userId: 'demo', name: 'TaskFlow Frontend', color: '#7c6af7', createdAt: new Date().toISOString() },
  { projectId: 'p2', userId: 'demo', name: 'AWS Backend', color: '#4ade80', createdAt: new Date().toISOString() },
  { projectId: 'p3', userId: 'demo', name: 'Design System', color: '#fb923c', createdAt: new Date().toISOString() },
];
