// lib/auth.ts

export const auth = {
  getUser() {
    if (typeof window === 'undefined') return null;

    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem('user');
  }
};