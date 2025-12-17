import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  base = '/api/users';
  constructor(private http: HttpClient) {}
  
  list(): Observable<any[]> { 
    return this.http.get<any>(`${this.base}/all`).pipe(
      map(response => response.users || response || [])
    ); 
  }
  
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }
  
  add(data: any): Observable<any> { 
    return this.http.post(this.base, data); 
  }
  
  delete(id: string | number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
  
  update(id: string | number, data: any): Observable<any> {
    return this.http.put(`${this.base}/${id}`, data);
  }
  
  updateStatus(id: string, active: boolean): Observable<any> {
    return this.http.put(`${this.base}/${id}/status`, { active });
  }
  
  updateRole(id: string, role: string): Observable<any> {
    return this.http.put(`${this.base}/${id}/role`, { role });
  }
  
  getStats(): Observable<any> {
    return this.http.get(`${this.base}/stats`);
  }
}
