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
}
