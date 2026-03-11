import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { CourseService } from '../../../core/services/course.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './course-list.html',
  styleUrls: ['./course-list.css']
})
export class CourseListComponent implements OnInit {
  courses: any[] = [];
  searchTerm = '';
  activeFilter = 'All';
  filters = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  get filteredCourses() {
    let list = this.courses;
    if (this.activeFilter !== 'All') {
      list = list.filter(c => (c.level || 'Beginner') === this.activeFilter);
    }
    const term = this.searchTerm?.toLowerCase()?.trim();
    if (term) {
      list = list.filter(c =>
        (c.title || '').toLowerCase().includes(term) ||
        (c.description || '').toLowerCase().includes(term) ||
        (c.category || '').toLowerCase().includes(term)
      );
    }
    return list;
  }

  constructor(
    private cs: CourseService,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.courses = this.cs.list();
  }

  setFilter(f: string) { this.activeFilter = f; }
  clearFilters() { this.searchTerm = ''; this.activeFilter = 'All'; }
  levelClass(level: string) {
    if (level === 'Intermediate') return 'lv-blue';
    if (level === 'Advanced') return 'lv-orange';
    return 'lv-green';
  }
  goBack() { this.location.back(); }
}
