import { Component, ViewChild, ElementRef, AfterViewChecked, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('scrollEl') scrollEl!: ElementRef;

  messages: Array<{from:string, text:string, time:string}> = [
    { from: 'bot', text: 'Hello! I\'m EduBoost, your AI learning assistant. How can I help you today? 🎓', time: this.now() }
  ];
  input = '';
  isTyping = false;

  suggestions = [
    'What courses are available?',
    'How do I track my progress?',
    'Give me study tips',
    'How do I reset my password?'
  ];

  private responses: Record<string, string> = {
    default: 'Great question! I\'m here to help you with your learning journey. Feel free to ask me about courses, progress tracking, or study tips.',
    cours: 'We offer courses in Math, CSS, Programming, Data Science, and more. Visit the Catalog page to explore all available courses!',
    catalog: 'Head to the Catalog section to browse all published courses. You can filter by level, category, and duration.',
    progress: 'You can track your progress in the Dashboard section. Each course shows your completion percentage and quiz scores.',
    quiz: 'Quizzes are available at the end of each course chapter. Your best score is recorded and contributes to your overall progress.',
    password: 'To reset your password, please contact your administrator who can update it from the Users Management panel.',
    study: 'Here are some study tips: 1. Set daily learning goals. 2. Review notes after each chapter. 3. Take quizzes to test your knowledge. 4. Use the chatbot to clarify doubts!',
    help: 'I can help you with: course information, progress tracking, quiz guidance, account settings, and study tips. What would you like to know?',
  };

  constructor(
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  now() {
    const d = new Date();
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      if (this.scrollEl) {
        this.scrollEl.nativeElement.scrollTop = this.scrollEl.nativeElement.scrollHeight;
      }
    } catch(e) {}
  }

  send() {
    const text = this.input.trim();
    if (!text) return;
    this.messages.push({ from: 'user', text, time: this.now() });
    this.input = '';
    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;
      const reply = this.getReply(text);
      this.messages.push({ from: 'bot', text: reply, time: this.now() });
    }, 900 + Math.random() * 600);
  }

  getReply(text: string): string {
    const t = text.toLowerCase();
    for (const [key, val] of Object.entries(this.responses)) {
      if (key !== 'default' && t.includes(key)) return val;
    }
    return this.responses['default'];
  }

  useSuggestion(s: string) {
    this.input = s;
    this.send();
  }

  onEnter(e: any) {
    if (!e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  autoResize(e: any) {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  }

  clearChat() {
    this.messages = [{ from: 'bot', text: 'Chat cleared! How can I assist you?', time: this.now() }];
  }

  goBack() { this.location.back(); }
}
