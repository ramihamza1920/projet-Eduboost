import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.css']
})
export class AdminProfileComponent implements OnInit {
  user: any = null;
  editMode  = false;
  editForm: any = {};
  toast = ''; toastType = 'success'; toastTimer: any;
  saving = false;

  showPwModal = false;
  pwForm = { current: '', newPw: '', confirm: '' };
  pwError = '';

  totalUsers   = 0;
  totalCourses = 0;
  activeUsers  = 0;

  permissions = [
    'User Management', 'Course Management',
    'Analytics & Reports', 'System Configuration',
    'Content Moderation', 'Security Settings',
  ];

  activity = [
    { icon: '👤', color: 'blue',   label: 'New student registered',      sub: 'Alice Martin joined EduBoost',              time: '2h ago' },
    { icon: '📚', color: 'purple', label: 'Course updated',               sub: 'Python Programming — new chapter added',    time: '5h ago' },
    { icon: '⚠️', color: 'amber',  label: 'System settings modified',     sub: 'Notification preferences updated',          time: '1d ago' },
    { icon: '✅', color: 'green',  label: 'Quiz published',               sub: 'Data Science Fundamentals — quiz live',     time: '2d ago' },
  ];

  constructor(
    private auth: AuthService,
    private cs: CourseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.user        = this.auth.getCurrentUser();
    const users      = this.auth.listUsers();
    this.totalUsers  = users.length;
    this.activeUsers = users.filter((u: any) => !u.disabled).length;
    this.totalCourses = this.cs.list().length;
  }

  startEdit() {
    this.editForm = { name: this.user.name, email: this.user.email };
    this.editMode = true;
  }
  cancelEdit() { this.editMode = false; }

  saveProfile() {
    if (!this.editForm.name?.trim()) { this.showToast('Name cannot be empty', 'danger'); return; }
    this.saving = true;
    setTimeout(() => {
      this.auth.updateUser(this.user.id, { name: this.editForm.name, email: this.editForm.email });
      if (isPlatformBrowser(this.platformId)) {
        const updated = {
          ...this.user,
          name:   this.editForm.name,
          email:  this.editForm.email,
          avatar: this.editForm.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        };
        localStorage.setItem('user', JSON.stringify(updated));
        this.user = updated;
      }
      this.editMode = false;
      this.saving   = false;
      this.showToast('Profile updated!', 'success');
    }, 600);
  }

  changePassword() {
    this.pwError = '';
    if (!this.pwForm.current)         { this.pwError = 'Enter your current password.'; return; }
    if (this.pwForm.newPw.length < 4) { this.pwError = 'New password must be ≥ 4 chars.'; return; }
    if (this.pwForm.newPw !== this.pwForm.confirm) { this.pwError = 'Passwords do not match.'; return; }
    this.auth.updateUser(this.user.id, { password: this.pwForm.newPw });
    this.showPwModal = false;
    this.pwForm = { current: '', newPw: '', confirm: '' };
    this.showToast('Password updated!', 'success');
  }

  showToast(msg: string, type = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = msg; this.toastType = type;
    this.toastTimer = setTimeout(() => this.toast = '', 3200);
  }

  getInitials() {
    return this.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';
  }
  getJoinDate() {
    return this.user?.joinDate
      ? new Date(this.user.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
      : '—';
  }
}
