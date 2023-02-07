import { UserData } from './user';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiBaseURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  async setSat(user: UserData, satellite: string): Promise<any> {
    return await this.http.post<any>(`${this.apiBaseURL}/SatAddr`, {userData: user, satAddr: satellite}).toPromise();
  }

}
