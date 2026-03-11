import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-courses.html',
  styleUrls: ['./admin-courses.css']
})
export class AdminCoursesComponent implements OnInit {
  courses: any[] = [];
  filter = '';
  showModal = false;
  isEdit = false;
  deleteTarget: any = null;
  toast: { msg: string; type: string } | null = null;
  toastTimeout: any;
  editId: number | null = null;
  formError = '';

  form: any = { title: '', description: '', level: 'Beginner', category: '', duration: '', image: '' };
  levels = ['Beginner', 'Intermediate', 'Advanced'];
  categories = ['Mathematics', 'Programming', 'Design', 'Data Science', 'Languages', 'Marketing', 'General'];

  constructor(
    private cs: CourseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.load();
  }

  load() { this.courses = this.cs.list(); }

  get filteredCourses() {
    const term = this.filter.toLowerCase().trim();
    if (!term) return this.courses;
    return this.courses.filter(c =>
      c.title.toLowerCase().includes(term) ||
      (c.category || '').toLowerCase().includes(term) ||
      (c.level || '').toLowerCase().includes(term)
    );
  }

  openCreate() {
    this.isEdit = false;
    this.form = { title: '', description: '', level: 'Beginner', category: 'General', duration: '4h', image: '' };
    this.formError = '';
    this.showModal = true;
  }

  openEdit(c: any) {
    this.isEdit = true;
    this.editId = c.id;
    this.form = { title: c.title, description: c.description || '', level: c.level || 'Beginner', category: c.category || '', duration: c.duration || '', image: c.image || '' };
    this.formError = '';
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.formError = ''; }

  saveCourse() {
    if (!this.form.title.trim()) { this.formError = 'Title is required.'; return; }
    if (this.isEdit) {
      this.cs.updateCourse(this.editId!, this.form);
      this.showToast('Course updated successfully', 'success');
    } else {
      this.cs.createCourse({ ...this.form, createdBy: 1 });
      this.showToast('Course created successfully', 'success');
    }
    this.load(); this.closeModal();
  }

  confirmDelete(c: any) { this.deleteTarget = c; }
  cancelDelete() { this.deleteTarget = null; }

  deleteCourse() {
    if (!this.deleteTarget) return;
    this.cs.deleteCourse(this.deleteTarget.id);
    this.deleteTarget = null;
    this.load();
    this.showToast('Course deleted', 'danger');
  }

  showToast(msg: string, type: string) {
    clearTimeout(this.toastTimeout);
    this.toast = { msg, type };
    this.toastTimeout = setTimeout(() => this.toast = null, 3000);
  }

  levelColor(level: string) {
    if (level === 'Beginner') return 'lv-green';
    if (level === 'Intermediate') return 'lv-blue';
    return 'lv-orange';
  }
}
