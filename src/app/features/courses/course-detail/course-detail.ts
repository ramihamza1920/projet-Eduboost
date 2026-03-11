import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './course-detail.html',
  styleUrls: ['./course-detail.css']
})
export class CourseDetailComponent implements OnInit {
  course: any = null;
  currentUser: any = null;

  /* Feedback */
  feedbacks: any[] = [];
  showFeedbackModal = false;
  feedbackForm = { rating: 0, comment: '' };
  feedbackHover = 0;
  feedbackError = '';
  feedbackToast: string | null = null;
  toastTimer: any;
  userFeedback: any = null;      // existing feedback from this user
  isEditingFeedback = false;

  /* Tabs */
  activeTab: 'chapters' | 'quizzes' | 'feedback' = 'chapters';

  constructor(
    private route: ActivatedRoute,
    private cs: CourseService,
    private auth: AuthService,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = Number(this.route.snapshot.params['id']);
    this.course = this.cs.getCourse(id);
    this.currentUser = this.auth.getCurrentUser();
    this.loadFeedbacks();
  }

  /* ── Feedback helpers ── */
  loadFeedbacks() {
    if (!isPlatformBrowser(this.platformId) || !this.course) return;
    const key = `eduboost_feedback_${this.course.id}`;
    this.feedbacks = JSON.parse(localStorage.getItem(key) || '[]');
    if (this.currentUser) {
      this.userFeedback = this.feedbacks.find((f: any) => f.userId === this.currentUser.id) || null;
    }
  }

  saveFeedbacks() {
    if (!isPlatformBrowser(this.platformId) || !this.course) return;
    localStorage.setItem(`eduboost_feedback_${this.course.id}`, JSON.stringify(this.feedbacks));
  }

  openFeedback() {
    if (this.userFeedback) {
      this.feedbackForm = { rating: this.userFeedback.rating, comment: this.userFeedback.comment };
      this.isEditingFeedback = true;
    } else {
      this.feedbackForm = { rating: 0, comment: '' };
      this.isEditingFeedback = false;
    }
    this.feedbackError = '';
    this.feedbackHover = 0;
    this.showFeedbackModal = true;
  }

  closeFeedback() { this.showFeedbackModal = false; }

  setRating(n: number) { this.feedbackForm.rating = n; }
  setHover(n: number) { this.feedbackHover = n; }

  submitFeedback() {
    if (!this.feedbackForm.rating) { this.feedbackError = 'Please select a star rating.'; return; }
    if (!this.feedbackForm.comment.trim()) { this.feedbackError = 'Please write a comment.'; return; }

    const now = new Date();
    const timeStr = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
    const userId = this.currentUser?.id || 0;
    const userName = this.currentUser?.name || 'Anonymous';
    const avatar = this.currentUser?.avatar || userName[0]?.toUpperCase() || 'U';

    if (this.isEditingFeedback && this.userFeedback) {
      const idx = this.feedbacks.findIndex((f: any) => f.userId === userId);
      if (idx > -1) {
        this.feedbacks[idx] = { ...this.feedbacks[idx], rating: this.feedbackForm.rating, comment: this.feedbackForm.comment, updatedAt: timeStr };
        this.userFeedback = this.feedbacks[idx];
      }
      this.showToast('Feedback updated!');
    } else {
      const fb = { id: Date.now(), userId, userName, avatar, rating: this.feedbackForm.rating, comment: this.feedbackForm.comment, createdAt: timeStr };
      this.feedbacks.unshift(fb);
      this.userFeedback = fb;
      this.showToast('Feedback submitted! Thank you 🎉');
    }
    this.saveFeedbacks();
    this.closeFeedback();
  }

  deleteFeedback(fb: any) {
    this.feedbacks = this.feedbacks.filter((f: any) => f.id !== fb.id);
    if (this.currentUser?.id === fb.userId) this.userFeedback = null;
    this.saveFeedbacks();
    this.showToast('Feedback removed.');
  }

  showToast(msg: string) {
    clearTimeout(this.toastTimer);
    this.feedbackToast = msg;
    this.toastTimer = setTimeout(() => this.feedbackToast = null, 3200);
  }

  get avgRating(): number {
    if (!this.feedbacks.length) return 0;
    return Math.round(this.feedbacks.reduce((s, f) => s + f.rating, 0) / this.feedbacks.length * 10) / 10;
  }

  get stars() { return [1, 2, 3, 4, 5]; }

  starClass(n: number, rating: number) {
    return n <= rating ? 'star-filled' : 'star-empty';
  }

  goBack() { this.location.back(); }

  getRatingLabel(n: number): string {
    return ['','Poor','Fair','Good','Very Good','Excellent'][n] || '';
  }

  getLevelClass(level: string) {
    if (level === 'Intermediate') return 'lv-blue';
    if (level === 'Advanced')    return 'lv-orange';
    return 'lv-green';
  }
}
