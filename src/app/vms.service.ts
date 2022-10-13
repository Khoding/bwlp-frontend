import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ImageBaseWrite, ImageDetailsRead, ImageSummaryRead, ImagePermissions} from './vm';

@Injectable({
  providedIn: 'root'
})
export class VmsService {
  private apiBaseURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  //#region PUT
  updateImageBase(vm: ImageBaseWrite, id: string) {
    return this.http.put<any>(`${this.apiBaseURL}/vms/${id}`, vm,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }

  setPermissions(userPermissions: any): Observable<any> {
    return this.http.put<any>(`${this.apiBaseURL}/vms/permissions`, userPermissions,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }

  setImageOwner(owner: any): Observable<any> {
    return this.http.put<any>(`${this.apiBaseURL}/vms/owner`, owner,
      { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }
  //#endregion PUT
}
