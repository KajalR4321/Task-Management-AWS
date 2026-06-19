export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  token: string;
}

export const auth = {
  getUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('taskflow_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: AuthUser): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('taskflow_user', JSON.stringify(user));
  },

  logout: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('taskflow_user');
    window.location.href = '/login';
  },

  isLoggedIn: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!auth.getUser();
  },
};