import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { CourseService } from '../../core/services/course.service';

@Component({
  selector: 'app-admin-dash',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dash.html',
  styleUrls: ['./admin-dash.css']
})
export default class AdminDashComponent implements OnInit {
  userName = 'Admin';
  recentUsers: any[] = [];
  stats: any[] = [];

  constructor(
    private auth: AuthService,
    private cs: CourseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const user = this.auth.getCurrentUser();
    if (user) this.userName = user.name || 'Admin';
    const users = this.auth.listUsers();
    const courses = this.cs.list();
    const studentCount = users.filter((u:any) => u.role === 'student').length;
    let sum = 0, cnt = 0;
    for (const u of users) {
      for (const c of courses) {
        const p = this.cs.getProgressForUserCourse(u.id, c.id)?.progress || 0;
        if (p > 0) { sum += p; cnt++; }
      }
    }
    const avgProgress = cnt ? Math.round(sum / cnt) : 0;

    this.stats = [
      { icon: 'users', color: 'blue', value: users.length, label: 'Total Users', sub: 'Platform members', trend: '+12%' },
      { icon: 'book', color: 'purple', value: courses.length, label: 'Total Courses', sub: 'Published content', trend: '+3%' },
      { icon: 'graduation', color: 'green', value: studentCount, label: 'Students', sub: 'Active learners', trend: '+8%' },
      { icon: 'chart', color: 'orange', value: avgProgress + '%', label: 'Avg Progress', sub: 'Across all courses', trend: '+5%' },
    ];
    this.recentUsers = users.slice(-5).reverse();
  }
}
