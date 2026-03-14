import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import this
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true, // If using standalone
  imports: [
    CommonModule,
    FormsModule // Add this for ngModel support
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  // Variables pour stocker les valeurs (corrigé)
  nameValue: string = '';        // Changé de 'name' à 'nameValue'
  emailValue: string = '';       // Changé de 'email' à 'emailValue'
         // Changé de 'phone' à 'phoneValue'
  passwordValue: string = '';
  confirmPasswordValue: string = '';
  agreeTerms: boolean = false;
  showPassword: boolean = false;
  submitted: boolean = false;
  message: string = '';

  constructor(private router: Router) {}

  onRegister() {
    this.submitted = true;
    
    if (this.isFormValid()) {
      this.message = 'Registration successful! Welcome aboard! 🎉';
      
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    } else {
      this.message = 'Please fix the errors above and try again.';
    }
  }

  isFormValid(): boolean {
    return (
      this.nameValue.length >= 3 &&
      this.isValidEmail(this.emailValue) &&
      
      this.isValidPassword(this.passwordValue) &&
      this.passwordValue === this.confirmPasswordValue &&
      this.agreeTerms
    );
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return emailPattern.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phonePattern = /^[0-9]{10,15}$/;
    return phonePattern.test(phone);
  }

  isValidPassword(password: string): boolean {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
  }

  getPasswordStrength(): number {
    let strength = 0;
    const pwd = this.passwordValue;
    
    if (pwd.length >= 8) strength += 25;
    if (pwd.match(/[a-z]/)) strength += 25;
    if (pwd.match(/[A-Z]/)) strength += 25;
    if (pwd.match(/[0-9]/)) strength += 12.5;
    if (pwd.match(/[@$!%*?&]/)) strength += 12.5;
    
    return strength;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}