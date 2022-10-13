import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThriftService {
  private apiBaseURL = 'http://192.168.200.20:9070';
  private client: SatelliteServerClient;
  private userToken = "059D4BFCB742B841CA319CD35B7358FC";

  constructor() {
    const transport: Thrift.Transport = new Thrift.Transport(this.apiBaseURL);
    const protocol: Thrift.Protocol = new Thrift.Protocol(transport);
    this.client = new SatelliteServerClient(protocol);
  }

  //#region VM 
  getOsList(): Observable<OperatingSystem[]> {
    return from(this.client.getOperatingSystems());  
  }

  async getVms(): Promise<ImageSummaryRead[]> {
    return await this.client.getImageList(this.userToken, null, 0);
  }

  async getVm(id: string): Promise<ImageDetailsRead> {
    return await this.client.getImageDetails(this.userToken, id);
  }

  getVmPermissions(id: string): Observable<Map<string, ImagePermissions>> {
    return from(this.client.getImagePermissions(this.userToken, id))
            .pipe(map(permissions => new Map(Object.entries(permissions))));
  }

  async postVm(name: string): Promise<string> {
    return this.client.createImage(this.userToken, name);
  }

  requestImageVersionUpload(requestInformations: { imageBaseId: string, fileSize: Int64 }): Observable<any> {
    return from(this.client.requestImageVersionUpload(this.userToken, requestInformations.imageBaseId, requestInformations.fileSize, null, null))
  }

  deleteVms(id: string): Observable<void> {
    return from(this.client.deleteImageBase(this.userToken, id));
  }

  deleteVmVersion(id: string): Observable<void> {
    return from(this.client.deleteImageVersion(this.userToken, id));
  }

  updateImageBase(vm: ImageBaseWrite, id: string): Observable<void> {
    return from(this.client.updateImageBase(this.userToken, id, vm));
  }

  setVmPermissions(id: string, permissions: { [k: string]: ImagePermissions }): Observable<void> {
    return from(this.client.writeImagePermissions(this.userToken, id, permissions));
  }

  setImageOwner(id: string, newOwnerId: string): Observable<void> {
    return from(this.client.setImageOwner(this.userToken, id, newOwnerId));
  }
  //#endregion VM

  //#region Lecture
  async getEvents(): Promise<LectureSummary[]> {
    return this.client.getLectureList(this.userToken, 0);
  }

  async getEvent(id: string): Promise<LectureRead> {
    return this.client.getLectureDetails(this.userToken, id);
  }

  getLocations(): Observable<Location[]> {
    return from(this.client.getLocations());
  }

  getLecturePermissions(id: string): Observable<Map<string, LecturePermissions>> {
    return from(this.client.getLecturePermissions(this.userToken, id))
            .pipe(map(permissions => new Map(Object.entries(permissions))));
  }
  //#endregion Lecture
}