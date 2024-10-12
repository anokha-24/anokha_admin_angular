import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public loginForm: FormGroup;
  public errorMessage: string;
  public apiService: ApiService;
  public router: Router;

  constructor() {
    this.loginForm = new FormGroup({
      managerEmail: new FormControl('', [Validators.required, Validators.email]),
      managerPassword: new FormControl('', [Validators.required])
    });
    this.errorMessage = '';
    this.apiService = inject(ApiService);
    this.router = inject(Router);
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const managerEmail = this.loginForm.value.managerEmail;
      const managerPassword = this.loginForm.value.managerPassword;

      const resMap = await this.apiService.loginOfficial(managerEmail, managerPassword);
      const data = resMap.get('data');
      const errorMessage = resMap.get('errorMessage');

      console.log(data, errorMessage);

      if (typeof errorMessage === 'string' && errorMessage.length > 0) {
        this.errorMessage = errorMessage;
        return;
      } else if (data && typeof data.SECRET_TOKEN === 'string' && data.SECRET_TOKEN.length > 0) {
        localStorage.setItem("SECRET_TOKEN", data.SECRET_TOKEN);
        localStorage.setItem("MANAGER_EMAIL", data.managerEmail);
        localStorage.setItem("MANAGER_FULL_NAME", data.managerFullName);
        localStorage.setItem("MANAGER_PHONE", data.managerPhone);
        localStorage.setItem("MANAGER_ROLE_ID", data.managerRoleId);
        localStorage.setItem("MANAGER_ROLE_NAME", data.managerRoleName);

        // Redirect to dashboard
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.errorMessage = 'Something went wrong. Please try again later.';
    }
  }
  
}
