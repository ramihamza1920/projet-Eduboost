import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {
    if (this.isBrowser()) this.ensureSeedData();
  }

  private isBrowser() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private ensureSeedData() {
    if (!localStorage.getItem('eduboost_users')) {
      const users = [
        { id: 1, name: 'Admin User', email: 'admin@eduboost.com', password: 'admin', role: 'admin', disabled: false, phone: '+213 555 0001', avatar: 'AU', joinDate: '2024-01-01' },
        { id: 2, name: 'Alice Martin', email: 'student@eduboost.com', password: 'student', role: 'student', disabled: false, phone: '+213 555 0002', avatar: 'AM', joinDate: '2024-02-15' },
        { id: 3, name: 'Bob Dupont', email: 'bob@eduboost.com', password: 'student', role: 'student', disabled: false, phone: '+213 555 0003', avatar: 'BD', joinDate: '2024-03-10' },
        { id: 4, name: 'Clara Souza', email: 'clara@eduboost.com', password: 'student', role: 'student', disabled: true, phone: '+213 555 0004', avatar: 'CS', joinDate: '2024-04-05' },
      ];
      localStorage.setItem('eduboost_users', JSON.stringify(users));
    }
    if (!localStorage.getItem('eduboost_notifications')) {
      const notifs = [
        { id: 1, type: 'user', icon: 'user-plus', color: 'blue', text: 'New user registered', time: '5 min ago', read: false },
        { id: 2, type: 'course', icon: 'book', color: 'green', text: 'New course published', time: '12 min ago', read: false },
        { id: 3, type: 'alert', icon: 'exclamation-triangle', color: 'red', text: 'System alert detected', time: '1 hour ago', read: false },
      ];
      localStorage.setItem('eduboost_notifications', JSON.stringify(notifs));
    }
  }

  private getUsers(): any[] {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem('eduboost_users') || '[]');
  }
  private saveUsers(users: any[]) {
    if (!this.isBrowser()) return;
    localStorage.setItem('eduboost_users', JSON.stringify(users));
  }

  signup(name: string, email: string, password: string, phone?: string) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) throw new Error('Email already used');
    const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const user = { id, name, email, password, phone: phone || '', role: 'student', disabled: false, avatar: initials, joinDate: new Date().toISOString().split('T')[0] };
    users.push(user);
    this.saveUsers(users);
    if (this.isBrowser()) { localStorage.setItem('token', 'mock-token-' + id); localStorage.setItem('user', JSON.stringify(user)); }
    return user;
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password && !u.disabled);
    if (user) {
      if (this.isBrowser()) { localStorage.setItem('token', 'mock-token-' + user.id); localStorage.setItem('user', JSON.stringify(user)); }
      return true;
    }
    return false;
  }

  getCurrentUser() { if (!this.isBrowser()) return null; return JSON.parse(localStorage.getItem('user') || 'null'); }
  isLoggedIn(): boolean { if (!this.isBrowser()) return false; return !!localStorage.getItem('token'); }

  logout(): void {
    if (this.isBrowser()) { localStorage.removeItem('token'); localStorage.removeItem('user'); }
    this.router.navigate(['/home']);
  }

  listUsers() { return this.getUsers(); }

  createUser(data: { name: string; email: string; password: string; role: string; phone?: string }) {
    const users = this.getUsers();
    if (users.find(u => u.email === data.email)) throw new Error('Email already used');
    const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const initials = data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const user = { id, ...data, phone: data.phone || '', disabled: false, avatar: initials, joinDate: new Date().toISOString().split('T')[0] };
    users.push(user);
    this.saveUsers(users);
    return user;
  }

  updateUser(id: number, data: Partial<{ name: string; email: string; password: string; role: string; phone: string }>) {
    const users = this.getUsers();
    const u = users.find(x => x.id === id);
    if (!u) return;
    Object.assign(u, data);
    if (data.name) u.avatar = data.name.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0, 2);
    this.saveUsers(users);
  }

  deleteUser(id: number) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== id);
    this.saveUsers(users);
  }

  toggleUserDisabled(id: number) {
    const users = this.getUsers();
    const u = users.find(x => x.id === id);
    if (u) { u.disabled = !u.disabled; this.saveUsers(users); }
  }

  setRole(id: number, role: string) {
    const users = this.getUsers();
    const u = users.find(x => x.id === id);
    if (u) { u.role = role; this.saveUsers(users); }
  }


  addNotification(text: string, color: string = 'blue') {
    if (!this.isBrowser()) return;
    const notifs = this.getNotifications();
    const now = new Date();
    const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    notifs.unshift({ id: Date.now(), color, text, time, read: false });
    localStorage.setItem('eduboost_notifications', JSON.stringify(notifs.slice(0, 20)));
  }

  getNotifications() {
    if (!this.isBrowser()) return [];
    return JSON.parse(localStorage.getItem('eduboost_notifications') || '[]');
  }

  markAllNotificationsRead() {
    if (!this.isBrowser()) return;
    const notifs = this.getNotifications().map((n: any) => ({ ...n, read: true }));
    localStorage.setItem('eduboost_notifications', JSON.stringify(notifs));
  }

  getUnreadCount() { return this.getNotifications().filter((n: any) => !n.read).length; }
}
