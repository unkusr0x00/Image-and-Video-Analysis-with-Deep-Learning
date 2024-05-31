import {Injectable, LOCALE_ID} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

const httpOptions = {
  headers: {'Content-Type': 'application/json'}, responseType: 'json' as 'json'
};

@Injectable({
  providedIn: 'root'
})

export class ServerService {

  constructor(private http: HttpClient) {
  }
/*
  search(query: string): Observable<any> {
    return this.http.get(`http://localhost:3000/search?query=${query}`, httpOptions);
  }

  getVideo(id: string): Observable<any> {
    return this.http.get(`http://localhost:3000/video?id=${id}`, httpOptions);
  }

  getThumbnail(id: string, time: number): Observable<any> {
    return this.http.get(`http://localhost:3000/thumbnail?id=${id}&time=${time}`, httpOptions);
  } */
}
