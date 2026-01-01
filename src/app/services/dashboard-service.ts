import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../environment/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface DashboardStats {
  stats: any[];
}

export interface Notification {
  id: number;
  title: string;
  icon: string;
  time: string;
  read: boolean;
  type?: string;
}

export interface SearchResult {
  items: any[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // API base URL from environment
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';
  
  // Current user subject for reactive updates
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // HTTP options
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {
    this.loadCurrentUserFromStorage();
  }

  /**
   * Load current user from localStorage
   */
  private loadCurrentUserFromStorage(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }

  /**
   * Get HTTP headers with auth token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // Handle specific status codes
      if (error.status === 401) {
        // Unauthorized - redirect to login
        localStorage.clear();
        window.location.href = '/login';
      } else if (error.status === 403) {
        errorMessage = 'Access denied';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get current user information
   */
  getCurrentUser(): Observable<User | null> {
    // Return cached user if available
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }

    // Fetch from API
    return this.http.get<User>(`${this.apiUrl}/user/current`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Error fetching current user:', error);
        // Return user from localStorage if API fails
        const cachedUser = localStorage.getItem('currentUser');
        if (cachedUser) {
          const user = JSON.parse(cachedUser);
          return of(user);
        }
        return of(null);
      })
    );
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get user notifications
   */
  getNotifications(limit: number = 10, unreadOnly: boolean = false): Observable<Notification[]> {
    let params = new HttpParams()
      .set('limit', limit.toString());
    
    if (unreadOnly) {
      params = params.set('unreadOnly', 'true');
    }

    return this.http.get<Notification[]>(`${this.apiUrl}/notifications`, {
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(
      catchError(error => {
        console.error('Error fetching notifications:', error);
        // Return mock data if API fails (for development)
        return of([
          {
            id: 1,
            title: 'Welcome to the dashboard',
            icon: 'info',
            time: 'Just now',
            read: false
          }
        ]);
      })
    );
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/notifications/${notificationId}/read`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/notifications/read-all`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Search across dashboard resources
   */
  search(query: string): Observable<SearchResult> {
    const params = new HttpParams().set('q', query);
    
    return this.http.get<SearchResult>(`${this.apiUrl}/search`, {
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(
      catchError(error => {
        console.error('Search error:', error);
        return of({ items: [], total: 0 });
      })
    );
  }

  /**
   * Get menu items with permissions
   */
  getMenuItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/menu`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching menu items:', error);
        // Return default menu if API fails
        return of([
          { label: 'Dashboard', route: '/dashboard/home', icon: 'dashboard' },
          { label: 'Analytics', route: '/dashboard/analytics', icon: 'analytics' },
          { label: 'Users', route: '/dashboard/users', icon: 'people' },
          { label: 'Settings', route: '/dashboard/settings', icon: 'settings' }
        ]);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        localStorage.clear();
      }),
      catchError(error => {
        // Still clear local data even if API fails
        this.currentUserSubject.next(null);
        localStorage.clear();
        return of({ success: true });
      })
    );
  }

  /**
   * Refresh user session
   */
  refreshSession(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/refresh`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update user profile
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/user/profile`,
      userData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get activity log
   */
  getActivityLog(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${this.apiUrl}/activity-log`, {
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Export dashboard data
   */
  exportData(format: 'csv' | 'pdf' | 'excel'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/dashboard/export`, {
      headers: this.getAuthHeaders(),
      params: new HttpParams().set('format', format),
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }
}