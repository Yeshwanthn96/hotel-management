import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  base = 'http://localhost:8080/api/users';
  constructor(private http: HttpClient) {}
  list(): Observable<any> { return this.http.get(this.base); }
  add(data:any): Observable<any> { return this.http.post(this.base, data); }
  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
  update(id: number, data: any) {
  return this.http.put(`${this.base}/${id}`, data);
}

}
