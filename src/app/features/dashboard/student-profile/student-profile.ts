import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.css']
})
export class StudentProfileComponent implements OnInit {
  user: any = null;
  editMode = false;
  editForm: any = {};
  toast = ''; toastType = 'success'; toastTimer: any;
  showDeleteConfirm = false;
  saving = false;

  // Password change
  showPwModal = false;
  pwForm = { current: '', newPw: '', confirm: '' };
  pwError = '';

  achievements = [
    { icon: '🎯', label: 'First Quiz Passed',    date: 'Jan 2026', color: 'indigo' },
    { icon: '📚', label: '5 Chapters Completed', date: 'Feb 2026', color: 'cyan'   },
    { icon: '🔥', label: '7-Day Streak',          date: 'Feb 2026', color: 'amber'  },
    { icon: '⭐', label: 'Top Scorer',             date: 'Mar 2026', color: 'green'  },
  ];

  constructor(
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.user = this.auth.getCurrentUser();
  }

  startEdit() {
    this.editForm = { name: this.user.name, email: this.user.email, phone: this.user.phone || '' };
    this.editMode = true;
  }

  cancelEdit() { this.editMode = false; }

  saveProfile() {
    if (!this.editForm.name?.trim()) { this.showToast('Name cannot be empty', 'danger'); return; }
    this.saving = true;
    setTimeout(() => {
      this.auth.updateUser(this.user.id, { name: this.editForm.name, email: this.editForm.email, phone: this.editForm.phone });
      this.user = this.auth.getCurrentUser() || { ...this.user, ...this.editForm };
      // Update localStorage user session
      if (isPlatformBrowser(this.platformId)) {
        const u = { ...this.user, ...this.editForm, avatar: this.editForm.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2) };
        localStorage.setItem('user', JSON.stringify(u));
        this.user = u;
      }
      this.editMode = false;
      this.saving = false;
      this.showToast('Profile updated successfully!', 'success');
      this.auth.addNotification('Profile updated', 'indigo');
    }, 700);
  }

  changePassword() {
    this.pwError = '';
    if (!this.pwForm.current) { this.pwError = 'Enter your current password.'; return; }
    if (this.pwForm.newPw.length < 4) { this.pwError = 'New password must be at least 4 characters.'; return; }
    if (this.pwForm.newPw !== this.pwForm.confirm) { this.pwError = 'Passwords do not match.'; return; }
    // In real app: verify current password
    this.auth.updateUser(this.user.id, { password: this.pwForm.newPw });
    this.showPwModal = false;
    this.pwForm = { current: '', newPw: '', confirm: '' };
    this.showToast('Password changed successfully!', 'success');
  }

  showToast(msg: string, type = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = msg; this.toastType = type;
    this.toastTimer = setTimeout(() => this.toast = '', 3200);
  }

  getInitials() { return this.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2) || 'ST'; }
  getJoinDate() { return this.user?.joinDate ? new Date(this.user.joinDate).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' }) : '—'; }
}
