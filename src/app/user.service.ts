import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserInfo } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiBaseURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  async getUserList(): Promise<UserInfo[]> {
    return await this.http.get<UserInfo[]>(`${this.apiBaseURL}/users`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})}).toPromise();
  }

}
