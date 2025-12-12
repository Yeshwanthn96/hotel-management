import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HotelsService {
  base = 'http://localhost:8080/api/hotels';
  constructor(private http: HttpClient) {}
  list(): Observable<any> { return this.http.get(this.base); }
  add(data:any): Observable<any> { return this.http.post(this.base, data); }
}
