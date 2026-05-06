import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-student-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-home.html',
  styleUrls: ['./student-home.css']
})
export class StudentHomeComponent implements OnInit {
  user: any = null;
  greeting = 'Good morning';
  courses: any[] = [];
  progressList: any[] = [];
  recommendations: any[] = [];

  stats = [
    { label: 'Enrolled Courses', value: 0,    icon: 'book',    color: 'indigo', sub: '' },
    { label: 'Completed',        value: 0,    icon: 'check',   color: 'green',  sub: '' },
    { label: 'Quizzes Passed',   value: 0,    icon: 'quiz',    color: 'cyan',   sub: '' },
    { label: 'Hours Learned',    value: '0h', icon: 'clock',   color: 'amber',  sub: 'Last 30 days' },
  ];

  recentActivity: any[] = [];
  continueCourses: any[] = [];

  constructor(
    private auth: AuthService,
    private cs: CourseService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.user   = this.auth.getCurrentUser();
    this.courses = this.cs.list();

    const h = new Date().getHours();
    this.greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

    this.progressList = this.courses.slice(0, 6).map((c, i) => {
      const staticProgress = [72, 45, 88, 30, 60, 15][i] || 0;
      return {
        course: c,
        progress: staticProgress,
        chapters: c.chapters?.length || 0,
        quizzes:  c.quizzes?.length  || 0,
        risk:     this.cs.calcRisk(staticProgress),
        rec:      this.cs.recommendationFor(staticProgress),
      };
    });

    this.continueCourses = this.progressList.filter(p => p.progress > 0 && p.progress < 100).slice(0, 3);

    this.recommendations = this.progressList
      .filter(p => p.progress < 80)
      .map(p => ({ course: p.course, rec: p.rec, risk: p.risk }))
      .slice(0, 3);

    // Stats from real data
    if (this.user) {
      const attempts = this.cs.getAttemptsForUser(this.user.id);
      const passed = attempts.filter((a: any) => a.score >= 50).length;
      this.stats[0].value = this.courses.length;
      this.stats[0].sub = `${this.courses.length} total courses`;
      this.stats[1].value = this.progressList.filter(p => p.progress === 100).length;
      this.stats[1].sub = this.progressList.length ? Math.round(this.progressList.filter(p=>p.progress===100).length/this.progressList.length*100)+'% completion rate' : '';
      this.stats[2].value = passed;
      this.stats[2].sub = attempts.length ? `Avg score ${Math.round(attempts.reduce((s:number,a:any)=>s+a.score,0)/attempts.length)}%` : 'No quizzes yet';

      // Real recent activity from notifications/history
      const notifs = this.auth.getNotifications ? this.auth.getNotifications() : [];
      this.recentActivity = notifs.slice(0, 5).map((n: any) => ({
        label: n.text,
        detail: n.detail || '',
        time: n.time || n.createdAt || '',
        icon: n.type === 'quiz' ? 'quiz' : n.type === 'course' ? 'star' : 'book',
        color: n.color || 'indigo'
      }));

      // If no notifications, fallback to empty with a message
      if (!this.recentActivity.length) {
        this.recentActivity = [];
      }
    }
  }

  getRiskColor(risk: string) {
    return risk === 'high' ? 'var(--a6)' : risk === 'medium' ? 'var(--a5)' : 'var(--a4)';
  }

  goToCourse(id: number) { this.router.navigate(['/courses', id]); }
  goToProgress()         { this.router.navigate(['/student/progress']); }
  goToCatalog()          { this.router.navigate(['/catalog']); }
  goToCourses()          { this.router.navigate(['/student/courses']); }
}
