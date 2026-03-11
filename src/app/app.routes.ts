import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Mentor public pages
  {
    path: 'home',
    loadComponent: () => import('./mentor/index/index').then(m => m.Index)
  },
  {
    path: 'about',
    loadComponent: () => import('./mentor/about/about').then(m => m.About)
  },
  {
    path: 'mentor/courses',
    loadComponent: () => import('./mentor/courses/courses').then(m => m.Courses)
  },
  {
    path: 'mentor/trainers',
    loadComponent: () => import('./mentor/trainers/trainers').then(m => m.Trainers)
  },
  {
    path: 'mentor/pricing',
    loadComponent: () => import('./mentor/pricing/pricing').then(m => m.Pricing)
  },
  {
    path: 'mentor/contact',
    loadComponent: () => import('./mentor/contact/contact').then(m => m.Contact)
  },
  {
    path: 'events',
    loadComponent: () => import('./mentor/events/events').then(m => m.Events)
  },
  {
    path: 'mentor/course-details',
    loadComponent: () => import('./mentor/course-details/course-details').then(m => m.CourseDetails)
  },

  // Student dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-entry').then(m => m.default)
  },
  { path: 'dashboard/user',          redirectTo: '/student/home', pathMatch: 'full' },
  { path: 'dashboard/user-redirect', redirectTo: '/student/home', pathMatch: 'full' },
  { path: 'dashboard/courses',  redirectTo: '/student/courses',  pathMatch: 'full' },
  { path: 'dashboard/profile',  redirectTo: '/student/profile',  pathMatch: 'full' },
  { path: 'dashboard/settings', redirectTo: '/student/settings', pathMatch: 'full' },

  {
    path: 'student',
    loadComponent: () => import('./features/dashboard/student-layout/student-layout').then(m => m.default),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home',     loadComponent: () => import('./features/dashboard/student-home/student-home').then(m => m.StudentHomeComponent) },
      { path: 'courses',  loadComponent: () => import('./features/dashboard/student-courses/student-courses').then(m => m.StudentCoursesComponent) },
      { path: 'progress', loadComponent: () => import('./features/dashboard/student-progress/student-progress').then(m => m.StudentProgressComponent) },
      { path: 'profile',  loadComponent: () => import('./features/dashboard/student-profile/student-profile').then(m => m.StudentProfileComponent) },
      { path: 'settings', loadComponent: () => import('./features/dashboard/student-settings/student-settings').then(m => m.StudentSettingsComponent) },
    ]
  },

  // Admin dashboard (protected)
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout').then(m => m.default),
    canActivate: [RoleGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-dash').then(m => m.default)
      },
      {
        path: 'courses',
        loadComponent: () => import('./features/admin/courses/admin-courses').then(m => m.AdminCoursesComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users').then(m => m.AdminUsersComponent)
      }
    ]
  },

  // Courses
  {
    path: 'catalog',
    loadComponent: () => import('./features/courses/course-list/course-list').then(m => m.CourseListComponent)
  },
  {
    path: 'courses/:id',
    loadComponent: () => import('./features/courses/course-detail/course-detail').then(m => m.CourseDetailComponent)
  },

  // Chatbot
  {
    path: 'chatbot',
    loadComponent: () => import('./features/chatbot/chatbot').then(m => m.ChatbotComponent)
  },

  // Access denied
  {
    path: 'access-denied',
    loadComponent: () => import('./features/shared/access-denied/access-denied').then(m => m.AccessDeniedComponent)
  },

  // Fallback
  { path: '**', redirectTo: '/home' }
];
