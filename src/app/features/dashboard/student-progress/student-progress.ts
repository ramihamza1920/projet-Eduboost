import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-progress.html',
  styleUrls: ['./student-progress.css']
})
export class StudentProgressComponent implements OnInit {
  progressList: any[] = [];
  quizHistory = [
    { course: 'Python Programming',      quiz: 'Python Basics Quiz',      score: 85, total: 4, date: '10 Mar 2026', passed: true  },
    { course: 'Introduction to Maths',   quiz: 'Numbers & Algebra Quiz',  score: 70, total: 3, date: '08 Mar 2026', passed: true  },
    { course: 'Web Design with CSS',     quiz: 'Selectors & Flexbox Quiz',score: 55, total: 3, date: '06 Mar 2026', passed: false },
    { course: 'Introduction to Maths',   quiz: 'Geometry & Calculus Quiz',score: 90, total: 2, date: '04 Mar 2026', passed: true  },
    { course: 'Digital Marketing',       quiz: 'Marketing Fundamentals',  score: 80, total: 2, date: '02 Mar 2026', passed: true  },
  ];
  private progressMap: Record<number, number> = { 1:72, 2:45, 3:88, 4:30, 5:60, 6:15 };
  avgScore = 0;
  avgProgress = 0;
  completedCount = 0;

  constructor(
    private cs: CourseService,
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const courses = this.cs.list();
    this.progressList = courses.map(c => ({
      ...c,
      progress: this.progressMap[c.id] ?? 0,
      risk: this.cs.calcRisk(this.progressMap[c.id] ?? 0),
      rec:  this.cs.recommendationFor(this.progressMap[c.id] ?? 0),
    }));
    this.avgProgress   = Math.round(this.progressList.reduce((s, p) => s + p.progress, 0) / this.progressList.length);
    this.completedCount = this.progressList.filter(p => p.progress >= 100).length;
    this.avgScore = Math.round(this.quizHistory.reduce((s, q) => s + q.score, 0) / this.quizHistory.length);
  }

  getRiskColor(risk: string) { return risk === 'high' ? '#ef4444' : risk === 'medium' ? '#f59e0b' : '#10b981'; }
  getScoreColor(s: number)   { return s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444'; }
  goToCourse(id: number)     { this.router.navigate(['/courses', id]); }
}
