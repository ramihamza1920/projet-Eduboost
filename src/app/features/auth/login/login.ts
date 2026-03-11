import { Component , PLATFORM_ID, Inject} from '@angular/core';
import { CommonModule , isPlatformBrowser} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';
  private returnUrl = '/dashboard';

  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService, @Inject(PLATFORM_ID) private platformId: Object) {
    const q = this.route.snapshot.queryParams['returnUrl'];
    if (q) this.returnUrl = q;
  }

  onLogin() {
    try{
      const ok = this.auth.login(this.email, this.password);
      if(ok){
        this.router.navigateByUrl(this.returnUrl || '/dashboard');
      } else {
        this.message = '❌ Email ou mot de passe incorrect';
      }
    }catch(e:any){ this.message = e.message || 'Erreur'; }
  }
}
