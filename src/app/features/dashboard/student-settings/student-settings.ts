import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-student-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-settings.html',
  styleUrls: ['./student-settings.css']
})
export class StudentSettingsComponent implements OnInit {
  toast = ''; toastType = 'success'; toastTimer: any;
  showDeleteConfirm = false;
  activeSection: 'notifications' | 'privacy' | 'preferences' | 'data' = 'notifications';

  prefs = {
    emailNotifs:    true,
    progressAlerts: true,
    quizReminders:  false,
    newsletter:     false,
    language:       'English',
    theme:          'dark',
    videoQuality:   'auto',
    subtitles:      'off',
  };

  privacy = {
    profilePublic: true,
    showProgress:  true,
    allowMessages: false,
  };

  constructor(
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('student_prefs');
    if (saved) { try { this.prefs = { ...this.prefs, ...JSON.parse(saved) }; } catch {} }
    const savedPv = localStorage.getItem('student_privacy');
    if (savedPv) { try { this.privacy = { ...this.privacy, ...JSON.parse(savedPv) }; } catch {} }
  }

  saveNotifications() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('student_prefs', JSON.stringify(this.prefs));
    }
    this.showToast('Notification preferences saved!', 'success');
    this.auth.addNotification('Notification settings updated', 'green');
  }

  savePrivacy() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('student_privacy', JSON.stringify(this.privacy));
    }
    this.showToast('Privacy settings saved!', 'success');
  }

  savePrefs() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('student_prefs', JSON.stringify(this.prefs));
    }
    this.showToast('Preferences saved!', 'success');
  }

  exportData() {
    if (!isPlatformBrowser(this.platformId)) return;
    const user = this.auth.getCurrentUser();
    const data = { user, prefs: this.prefs, privacy: this.privacy, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'eduboost-data.json'; a.click();
    URL.revokeObjectURL(url);
    this.showToast('Data exported!', 'info');
  }

  confirmDelete() { this.showDeleteConfirm = true; }
  cancelDelete()  { this.showDeleteConfirm = false; }

  deleteAccount() {
    this.showDeleteConfirm = false;
    this.showToast('Account deleted. Signing out…', 'danger');
    setTimeout(() => this.auth.logout(), 2500);
  }

  showToast(msg: string, type = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = msg; this.toastType = type;
    this.toastTimer = setTimeout(() => this.toast = '', 3500);
  }
}
