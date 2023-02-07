import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThriftService {
  private apiBaseURL = 'http://localhost:9070';
  private client: SatelliteServerClient;
  private masterClient: MasterServerClient;

  constructor() {
    const transport: Thrift.Transport = new Thrift.Transport(this.apiBaseURL);
    const protocol: Thrift.Protocol = new Thrift.Protocol(transport);
    this.client = new SatelliteServerClient(protocol);
    this.masterClient = new MasterServerClient(protocol);
  }

  //#region VM 
  getOsList(): Observable<OperatingSystem[]> {
    return from(this.client.getOperatingSystems());  
  }

  async getVms(): Promise<ImageSummaryRead[]> {
    return await this.client.getImageList(JSON.parse(sessionStorage.getItem('user')).authToken, null, 0);
  }

  async getVm(id: string): Promise<ImageDetailsRead> {
    return await this.client.getImageDetails(JSON.parse(sessionStorage.getItem('user')).authToken, id);
  }

  getVmPermissions(id: string): Observable<Map<string, ImagePermissions>> {
    return from(this.client.getImagePermissions(JSON.parse(sessionStorage.getItem('user')).authToken, id))
            .pipe(map(permissions => new Map(Object.entries(permissions))));
  }

  async postVm(name: string): Promise<string> {
    return this.client.createImage(JSON.parse(sessionStorage.getItem('user')).authToken, name);
  }

  requestImageVersionUpload(requestInformations: { imageBaseId: string, fileSize: Int64 }): Observable<any> {
    return from(this.client.requestImageVersionUpload(JSON.parse(sessionStorage.getItem('user')).authToken, requestInformations.imageBaseId, requestInformations.fileSize, null, null))
  }

  deleteVms(id: string): Observable<void> {
    return from(this.client.deleteImageBase(JSON.parse(sessionStorage.getItem('user')).authToken, id));
  }

  deleteVmVersion(id: string): Observable<void> {
    return from(this.client.deleteImageVersion(JSON.parse(sessionStorage.getItem('user')).authToken, id));
  }

  updateImageBase(vm: ImageBaseWrite, id: string): Observable<void> {
    return from(this.client.updateImageBase(JSON.parse(sessionStorage.getItem('user')).authToken, id, vm));
  }

  setVmPermissions(id: string, permissions: { [k: string]: ImagePermissions }): Observable<void> {
    return from(this.client.writeImagePermissions(JSON.parse(sessionStorage.getItem('user')).authToken, id, permissions));
  }

  setImageOwner(id: string, newOwnerId: string): Observable<void> {
    return from(this.client.setImageOwner(JSON.parse(sessionStorage.getItem('user')).authToken, id, newOwnerId));
  }
  //#endregion VM

  //#region Lecture
  async getEvents(): Promise<LectureSummary[]> {
    return this.client.getLectureList(JSON.parse(sessionStorage.getItem('user')).authToken, 0);
  }

  async getEvent(id: string): Promise<LectureRead> {
    return this.client.getLectureDetails(JSON.parse(sessionStorage.getItem('user')).authToken, id);
  }

  getLocations(): Observable<Location[]> {
    return from(this.client.getLocations());
  }

  getLecturePermissions(id: string): Observable<Map<string, LecturePermissions>> {
    return from(this.client.getLecturePermissions(JSON.parse(sessionStorage.getItem('user')).authToken, id))
            .pipe(map(permissions => new Map(Object.entries(permissions))));
  }

  async postEvent(lecture: LectureWrite): Promise<string> {
    return this.client.createLecture(JSON.parse(sessionStorage.getItem('user')).authToken, lecture);
  }

  deleteEvent(id: string): Observable<void> {
    return from(this.client.deleteLecture(JSON.parse(sessionStorage.getItem('user')).authToken, id));
  }

  setLecturePermissions(id: string, permissions: { [k: string]: LecturePermissions }): Observable<void> {
    return from(this.client.writeLecturePermissions(JSON.parse(sessionStorage.getItem('user')).authToken, id, permissions));
  }

  updateLecture(lecture: LectureWrite, id: string): Observable<void> {
    return from(this.client.updateLecture(JSON.parse(sessionStorage.getItem('user')).authToken, id, lecture));
  }

  setLectureOwner(id: string, newOwnerId: string): Observable<void> {
    return from(this.client.setLectureOwner(JSON.parse(sessionStorage.getItem('user')).authToken, id, newOwnerId));
  }
  //#endregion Lecture

  //#region Login
  login(user: string, password: string): Observable<ClientSessionData> {
    return from(this.masterClient.localAccountLogin(user, password));
  }

  //#endregion Login

  //#region User
  getUserList(): Observable<UserInfo[]> {
    this.client.getSupportedFeatures().then((res) => {
      console.log(res);
    })
    return from(this.client.getUserList(JSON.parse(sessionStorage.getItem('user')).authToken, 0));
  }
  //#endregion User
}