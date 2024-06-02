import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  private apiUrlSubmit = 'https://vbs.videobrowsing.org/api/v2/submit';
  private apiUrl = 'https://vbs.videobrowsing.org/api/v2';

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/login`;
    const loginData = { username, password };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this.http.post<any>(url, loginData, { headers });
  }

  submitEvaluation(evaluationId: string, sessionToken: string, submissionData: any): Observable<any> {
    const url = `${this.apiUrlSubmit}/${evaluationId}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const params = { session: sessionToken };

    return this.http.post<any>(url, submissionData, { headers, params });
  }

}
