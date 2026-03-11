import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filter = '';
  showModal = false;
  isEdit = false;
  deleteTarget: any = null;
  toast: { msg: string; type: string } | null = null;
  toastTimeout: any;

  form: any = { name: '', email: '', password: '', role: 'student', phone: '' };
  editId: number | null = null;
  formError = '';

  constructor(
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.load();
  }

  load() { this.users = this.auth.listUsers(); }

  get filteredUsers() {
    const term = this.filter.toLowerCase().trim();
    if (!term) return this.users;
    return this.users.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  }

  openCreate() {
    this.isEdit = false;
    this.form = { name: '', email: '', password: '', role: 'student', phone: '' };
    this.formError = '';
    this.showModal = true;
  }

  openEdit(u: any) {
    this.isEdit = true;
    this.editId = u.id;
    this.form = { name: u.name, email: u.email, password: u.password, role: u.role, phone: u.phone || '' };
    this.formError = '';
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.formError = ''; }

  saveUser() {
    if (!this.form.name.trim() || !this.form.email.trim()) { this.formError = 'Name and email are required.'; return; }
    if (!this.isEdit && !this.form.password.trim()) { this.formError = 'Password is required for new users.'; return; }
    try {
      if (this.isEdit) {
        this.auth.updateUser(this.editId!, this.form);
        this.showToast('User updated successfully', 'success');
      } else {
        this.auth.createUser(this.form);
        this.showToast('User created successfully', 'success');
      }
      this.load(); this.closeModal();
    } catch (e: any) { this.formError = e.message; }
  }

  confirmDelete(u: any) { this.deleteTarget = u; }
  cancelDelete() { this.deleteTarget = null; }

  deleteUser() {
    if (!this.deleteTarget) return;
    this.auth.deleteUser(this.deleteTarget.id);
    this.deleteTarget = null;
    this.load();
    this.showToast('User deleted', 'danger');
  }

  toggle(u: any) {
    this.auth.toggleUserDisabled(u.id);
    this.load();
    this.showToast(`User ${u.disabled ? 'enabled' : 'disabled'}`, 'info');
  }

  showToast(msg: string, type: string) {
    clearTimeout(this.toastTimeout);
    this.toast = { msg, type };
    this.toastTimeout = setTimeout(() => this.toast = null, 3000);
  }

  get totalCount() { return this.users.length; }
  get activeCount() { return this.users.filter(u => !u.disabled).length; }
  get adminCount() { return this.users.filter(u => u.role === 'admin').length; }
  get studentCount() { return this.users.filter(u => u.role === 'student').length; }
}
