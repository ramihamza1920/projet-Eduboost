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

  // Static enriched stats
  stats = [
    { label: 'Enrolled Courses', value: 6,    icon: 'book',    color: 'indigo', sub: '+2 this month' },
    { label: 'Completed',        value: 2,    icon: 'check',   color: 'green',  sub: '33% completion rate' },
    { label: 'Quizzes Passed',   value: 8,    icon: 'quiz',    color: 'cyan',   sub: 'Avg score 78%' },
    { label: 'Hours Learned',    value: '24h',icon: 'clock',   color: 'amber',  sub: 'Last 30 days' },
  ];

  recentActivity = [
    { type: 'quiz',    label: 'Completed Quiz', detail: 'Python Basics Quiz — Score 85%',    time: '2h ago',   icon: 'quiz',  color: 'cyan' },
    { type: 'chapter', label: 'Read Chapter',   detail: 'Variables & Data Types — Python',    time: '3h ago',   icon: 'book',  color: 'indigo' },
    { type: 'chapter', label: 'Read Chapter',   detail: 'Flexbox Layout — CSS Design',        time: '1d ago',   icon: 'book',  color: 'indigo' },
    { type: 'course',  label: 'Enrolled',       detail: 'Data Science Fundamentals',          time: '2d ago',   icon: 'star',  color: 'amber' },
    { type: 'quiz',    label: 'Completed Quiz', detail: 'Numbers & Algebra — Score 70%',      time: '3d ago',   icon: 'quiz',  color: 'cyan' },
  ];

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

    // Progress list with static enriched data
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
  }

  getRiskColor(risk: string) {
    return risk === 'high' ? 'var(--a6)' : risk === 'medium' ? 'var(--a5)' : 'var(--a4)';
  }

  goToCourse(id: number) { this.router.navigate(['/courses', id]); }
  goToProgress()         { this.router.navigate(['/student/progress']); }
  goToCatalog()          { this.router.navigate(['/catalog']); }
  goToCourses()          { this.router.navigate(['/student/courses']); }
}
