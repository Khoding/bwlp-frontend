import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LectureWrite, Location, LectureSummary, LectureRead, LecturePermissions} from './veranstaltung';

@Injectable({
  providedIn: 'root'
})
export class VeranstaltungenService {

  private apiBaseURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  //#region GET
  async getEvents(): Promise<LectureSummary[]> {
    return await this.http.get<LectureSummary[]>(`${this.apiBaseURL}/events`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})}).toPromise();
  }

  async getEvent(id: string): Promise<LectureRead> {
    return await this.http.get<LectureRead>(`${this.apiBaseURL}/events/${id}`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})}).toPromise();
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiBaseURL}/locations`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }

  getPermissions(id: string): Observable<Map<any, LecturePermissions>> {
    return this.http.get<any>(`${this.apiBaseURL}/events/permissions/${id}`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }
  //#endregion GET

  //#region POST
  async postEvent(lecture: LectureWrite): Promise<LectureWrite> {
    return this.http.post<LectureWrite>(`${this.apiBaseURL}/event` , lecture,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})}).toPromise();
  }
  //#endregion POST

  //#region DELETE
  deleteEvent(id: string): Observable<string> {
    return this.http.delete<string>(`${this.apiBaseURL}/events/${id}`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }
  //#endregion DELETE

  //#region PUT
  setPermissions(userPermissions: any): Observable<any> {
    return this.http.put<any>(`${this.apiBaseURL}/events/permissions`, userPermissions,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }

  updateLecture(lecture: LectureWrite, id: string) {
    return this.http.put<any>(`${this.apiBaseURL}/events/${id}`, lecture,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }

  setLectureOwner(owner: any): Observable<any> {
    return this.http.put<any>(`${this.apiBaseURL}/events/owner`, owner,
      { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }
  //#endregion PUT

}
