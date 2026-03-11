import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './student-courses.html',
  styleUrls: ['./student-courses.css']
})
export class StudentCoursesComponent implements OnInit {
  courses: any[] = [];
  filtered: any[] = [];
  search = '';
  filterLevel = 'all';
  toast = ''; toastType = 'success'; toastTimer: any;
  levels = ['all','Beginner','Intermediate','Advanced'];

  // Static progress per course
  private progressMap: Record<number, number> = { 1:72, 2:45, 3:88, 4:30, 5:60, 6:15 };

  constructor(
    private cs: CourseService,
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const allCourses = this.cs.list();
    this.courses = allCourses.map(c => ({
      ...c,
      progress: this.progressMap[c.id] ?? Math.floor(Math.random() * 80),
      enrolled: true,
    }));
    this.applyFilter();
  }

  applyFilter() {
    this.filtered = this.courses.filter(c => {
      const matchSearch = !this.search || c.title.toLowerCase().includes(this.search.toLowerCase());
      const matchLevel  = this.filterLevel === 'all' || c.level === this.filterLevel;
      return matchSearch && matchLevel;
    });
  }

  getLevelClass(level: string) {
    if (level === 'Intermediate') return 'lv-blue';
    if (level === 'Advanced')     return 'lv-orange';
    return 'lv-green';
  }

  getStatusLabel(p: number) { return p === 0 ? 'Not started' : p === 100 ? 'Completed' : 'In progress'; }
  getStatusClass(p: number) { return p === 0 ? 'st-new' : p === 100 ? 'st-done' : 'st-progress'; }

  viewCourse(id: number) { this.router.navigate(['/courses', id]); }

  showToast(msg: string, type = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = msg; this.toastType = type;
    this.toastTimer = setTimeout(() => this.toast = '', 3200);
  }

  resumeCourse(c: any) {
    if (c.chapters?.length) {
      this.router.navigate(['/courses', c.id, 'chapters', c.chapters[0].id]);
    } else {
      this.viewCourse(c.id);
    }
    this.showToast(`Resuming "${c.title}"`, 'info');
  }
}
