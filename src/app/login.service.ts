import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private masterURL = 'https://bwlp-masterserver.ruf.uni-freiburg.de/thrift/';
  private masterClient: MasterServerClient;

  constructor() {
    const masterTransport: Thrift.Transport = new Thrift.Transport(this.masterURL);
    const masterProtocol: Thrift.Protocol = new Thrift.Protocol(masterTransport);
    this.masterClient = new MasterServerClient(masterProtocol);
  }

  login(user: string, password: string): Observable<ClientSessionData> {
    return from(this.masterClient.localAccountLogin(user, password));
  }
}
