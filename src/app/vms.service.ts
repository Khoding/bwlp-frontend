import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ImageBaseWrite, ImageDetailsRead, ImageSummaryRead, OperatingSystems, ImagePermissions} from './vm';

@Injectable({
  providedIn: 'root'
})
export class VmsService {
  private apiBaseURL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  //#region GET
  async getVms(): Promise<ImageSummaryRead[]> {
    return await this.http.get<ImageSummaryRead[]>(`${this.apiBaseURL}/vms`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})}).toPromise();
  }

  async getVm(id: string): Promise<ImageDetailsRead> {
    return await this.http.get<ImageDetailsRead>(`${this.apiBaseURL}/vms/${id}`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})}).toPromise();
  }

  getOsList(): Observable<OperatingSystems[]> {
    return this.http.get<OperatingSystems[]>(`${this.apiBaseURL}/operatingSystems`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }

  getPermissions(id: string): Observable<Map<any, ImagePermissions>> {
    return this.http.get<any>(`${this.apiBaseURL}/vms/permissions/${id}`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }
  //#endregion GET

  //#region POST
  async postVm(name: string): Promise<string> {
    return this.http.post<string>(`${this.apiBaseURL}/vm`, {imageName: name},
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})}).toPromise();
  }

  requestImageVersionUpload(requestInformations: {}): Observable<any> {
    return this.http.post<any>(`${this.apiBaseURL}/vm/upload`, requestInformations,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }
  //#endregion POST

  //#region DELETE
  deleteVms(id: string): Observable<string> {
    return this.http.delete<string>(`${this.apiBaseURL}/vms/${id}`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }

  deleteVmVersion(id: string): Observable<string> {
    return this.http.delete<string>(`${this.apiBaseURL}/vms/version/${id}`,
    { headers: new HttpHeaders({Authorization: JSON.parse(sessionStorage.getItem('user')).sessionId})});
  }
  //#endregion DELETE

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
