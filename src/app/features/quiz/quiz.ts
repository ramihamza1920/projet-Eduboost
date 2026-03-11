import { Component , PLATFORM_ID, Inject} from '@angular/core';
import { CommonModule , isPlatformBrowser} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.html',
  styleUrls: ['./quiz.css']
})
export class QuizComponent {
  quiz: any = null;
  courseId=0;
  answers: any[] = [];
  score: number|null = null;
  constructor(private route: ActivatedRoute, private cs: CourseService, private auth: AuthService, @Inject(PLATFORM_ID) private platformId: Object){
    const cId = Number(this.route.snapshot.params['courseId']);
    const qId = Number(this.route.snapshot.params['quizId']);
    this.courseId = cId;
    const course = this.cs.getCourse(cId);
    if(course) this.quiz = (course.quizzes||[]).find((q:any)=>q.id==qId);
  }
  submit(){
    if(!this.quiz) return;
    let correct=0;
    for(let i=0;i<this.quiz.questions.length;i++){
      if(this.answers[i] == this.quiz.questions[i].correct) correct++;
    }
    const percent = Math.round((correct/this.quiz.questions.length)*100);
    this.score = percent;
    const user = this.auth.getCurrentUser();
    this.cs.addAttempt(this.courseId, this.quiz.id, user?.id||0, percent);
  }

  answeredCount(){
    return this.answers.filter(a => a !== undefined && a !== null).length;
  }

  reset(){
    this.answers = [];
    this.score = null;
  }
}
