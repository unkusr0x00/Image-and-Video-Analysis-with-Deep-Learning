import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private Url = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  search(query: string): Observable<any> {
    const url = `${this.Url}/search`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const searchData = { query };
    console.log(searchData);

    return this.http.post<any>(url, searchData, { headers });
  }

  searchID(VideoID: string): Observable<any> {
    const url = `${this.Url}/searchID`;
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const searchData = { VideoID };
    console.log(searchData);

    return this.http.post<any>(url, searchData, { headers });
  }
}
