import { UserData } from './user';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiBaseURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  async login(usern: string, passwd: string): Promise<UserData> {
    return await this.http.post<any>(`${this.apiBaseURL}/login`, {username: usern, password: passwd}).toPromise();
  }

  async logout(): Promise<any> {
    return await this.http.post<any>(`${this.apiBaseURL}/logout`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})}).toPromise();
  }

  async setSat(user: UserData, satellite: string): Promise<any> {
    return await this.http.post<any>(`${this.apiBaseURL}/SatAddr`, {userData: user, satAddr: satellite}).toPromise();
  }

}
