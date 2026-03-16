import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-chapter',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './chapter.html',
  styleUrls: ['./chapter.css']
})
export class ChapterComponent implements OnInit {
  course:       any = null;
  chapter:      any = null;
  courseId:     number = 0;
  chapterIndex: number = 0;
  videoUrl:     SafeResourceUrl | null = null;
  videoPlaying  = false;

  // YouTube video mapping: courseId -> chapterId -> YouTube video ID
  private videoMap: Record<number, Record<number, string>> = {
    1: { // Introduction to Mathematics
      1: 'ORueTGEP-jg',  // Numbers & Operations
      2: 'NybHckSEQBI',  // Algebra Basics
      3: 'XGeXQS2QQAA',  // Geometry Fundamentals
      4: 'WUvTyaaNkzM',  // Calculus Introduction
    },
    2: { // Web Design with CSS
      1: 'l1mER1bV0N0',  // CSS Selectors
      2: 'JJSoEo8JSnc',  // Flexbox
      3: 'EiNiSFIPIQE',  // CSS Grid
      4: 'SgmNxE9lWcY',  // Animations
      5: 'yU7jJ3NbPdA',  // Responsive Design
    },
    3: { // Python Programming
      1: 'kqtD5dpn9C8',  // Variables & Data Types
      2: '_uQrJ0TkZlc',  // Control Flow
      3: 'u-OmVr_fT4s',  // Functions
      4: 'W8KRzm-HUcc',  // Lists & Dicts
      5: 'JeznW_7DlB0',  // OOP
      6: 'Uh2ebFW8OO0',  // File I/O
    },
    4: { // Data Science
      1: 'vmEHCJofslg',  // NumPy & Pandas
      2: 'a9UrKTVEeZA',  // Visualization
      3: 'oBU7PFdD_04',  // Data Cleaning
      4: 'i_LwzRVP7bg',  // Machine Learning
    },
    5: { // English Communication
      1: 'CzxGXFEt0_E',  // Business Writing
      2: 'JNOXZumCXNM',  // Presentation Skills
      3: 'sJYUhSGvs-E',  // Meeting Language
    },
    6: { // Digital Marketing
      1: 'hF515-0Tduk',  // SEO
      2: 'nMBRHT2Z8WY',  // Social Media
      3: 'Q0hi2X84h2g',  // Email Marketing
      4: 'i4pqMIDOFIo',  // Analytics
    },
  };

  constructor(
    private route:     ActivatedRoute,
    private cs:        CourseService,
    private location:  Location,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const courseId  = Number(this.route.snapshot.params['courseId']);
    const chapterId = Number(this.route.snapshot.params['chapterId']);
    this.courseId = courseId;
    this.course   = this.cs.getCourse(courseId);
    if (this.course) {
      this.chapterIndex = (this.course.chapters || []).findIndex((c: any) => c.id == chapterId);
      this.chapter      = this.course.chapters?.[this.chapterIndex] || null;
    }
    // Reset play state on navigation
    this.videoPlaying = false;
    this.videoUrl = null;
  }

  playVideo() {
    const vid = this.videoMap[this.courseId]?.[this.chapter?.id];
    if (vid) {
      const url = `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0&modestbranding=1`;
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    this.videoPlaying = true;
  }

  get videoId(): string | null {
    return this.videoMap[this.courseId]?.[this.chapter?.id] || null;
  }

  get prevChapter(): any { return this.course?.chapters?.[this.chapterIndex - 1] || null; }
  get nextChapter():  any { return this.course?.chapters?.[this.chapterIndex + 1] || null; }

  goBack() { this.location.back(); }
}
