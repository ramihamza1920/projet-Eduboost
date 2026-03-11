import { Component , PLATFORM_ID, Inject} from '@angular/core';
import { CommonModule , isPlatformBrowser} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-chapter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chapter.html',
  styleUrls: ['./chapter.css']
})
export class ChapterComponent {
  chapter: any = null;
  courseId: number = 0;
  constructor(private route: ActivatedRoute, private cs: CourseService, @Inject(PLATFORM_ID) private platformId: Object){
    const cId = Number(this.route.snapshot.params['courseId']);
    const chapId = Number(this.route.snapshot.params['chapterId']);
    this.courseId = cId;
    const course = this.cs.getCourse(cId);
    if(course) this.chapter = (course.chapters||[]).find((ch:any)=>ch.id==chapId);
  }
}
