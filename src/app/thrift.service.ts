import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThriftService {
  private apiBaseURL = 'http://192.168.200.20:9070';
  private client: SatelliteServerClient;

  constructor() {
    const transport: Thrift.Transport = new Thrift.Transport(this.apiBaseURL);
    const protocol: Thrift.Protocol = new Thrift.Protocol(transport);
    this.client = new SatelliteServerClient(protocol);
  }

  getOsList(): Observable<OperatingSystem[]> {
    return from(this.client.getOperatingSystems());  
  }
}