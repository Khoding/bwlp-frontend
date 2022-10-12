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

  getOsList(): Observable<OperatingSystem[]> {
    return from(this.client.getOperatingSystems());  
  }

  async getVms(): Promise<ImageSummaryRead[]> {
    return await this.client.getImageList(this.userToken, null, 0);
  }

  async getVm(id: string): Promise<ImageDetailsRead> {
    return await this.client.getImageDetails(this.userToken, id);
  }

  getPermissions(id: string): Observable<Map<string, ImagePermissions>> {
    return from(this.client.getImagePermissions(this.userToken, id))
            .pipe(map(permissions => new Map(Object.entries(permissions))));
  }

  async postVm(name: string): Promise<string> {
    return this.client.createImage(this.userToken, name);
  }
}