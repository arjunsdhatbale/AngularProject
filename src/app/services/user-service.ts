import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, UserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/user';

  saveUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/save-user`, user);
  }

 updateUser(id: number, userDto: UserDto): Observable<UserDto> {
  return this.http.patch<UserDto>(
    `${this.baseUrl}/update-user/${id}`,
    JSON.stringify(userDto),
    { headers: { 'Content-Type': 'application/json' } }
  );
}



  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/get-all-user`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/get-user-by-id/${id}`);
  }

  deleteUserById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete-user-by-id/${id}`);
  }
}
