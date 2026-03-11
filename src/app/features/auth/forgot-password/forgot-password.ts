import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  emailValue: string = '';  // Changé de 'email' à 'emailValue'
  message = '';
  loading = false;
  submitted = false;

  constructor(private router: Router) {}

  onSubmit() {
    this.submitted = true;
    
    if (!this.emailValue) {
      this.message = '❌ Please enter your email';
      return;
    }
    
    if (!this.isValidEmail(this.emailValue)) {
      this.message = '❌ Please enter a valid email address';
      return;
    }
    
    this.loading = true;
    this.message = '';
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.message = '✅ Reset link sent! Check your email (mock)';
      
      // Redirect to login after 2 seconds
      setTimeout(() => this.router.navigate(['/login']), 2000);
    }, 1500);
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return emailPattern.test(email);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}