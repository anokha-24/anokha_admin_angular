import { Injectable } from '@angular/core';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl: string;
  loginUrl: string;
  hashService: CryptoService;
  resMap: Map<string, any>;

  constructor() { 
    this.baseUrl = 'https://anokha.amrita.edu/api'
    this.loginUrl = `${this.baseUrl}/auth/loginOfficial`
    this.hashService = new CryptoService()
    this.resMap = new Map<string, any>();
  }

  async loginOfficial(managerEmail: string, managerPassword: string) : Promise<Map<string, any>> {
    try {
      const hashedPassword = await this.hashService.sha256(managerPassword);
      const response = await fetch(this.loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "managerEmail": managerEmail,
          "managerPassword": hashedPassword
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.resMap.set('data', data);
        this.resMap.set('errorMessage', '');
      } else if (response.status === 400) {
        const data = await response.json();
        this.resMap.set('data', null);
        this.resMap.set('errorMessage', data.MESSAGE);
      } else {
        this.resMap.set('data', null);
        this.resMap.set('errorMessage', 'Something went wrong. Please try again later.');
      }
      
    } catch (err) {
      this.resMap.set('data', null);
      this.resMap.set('errorMessage', 'Something went wrong. Please try again later.');
    } finally {
      return this.resMap;
    }
  }
}
