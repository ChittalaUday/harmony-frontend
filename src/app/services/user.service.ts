import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
const API_URL = environment.apiUrl;
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`
  })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) { }

  /** Load user's favorites from backend and update observable */
  loadFavorites(userId: string): void {
    const params = new HttpParams().set('userId', userId);
    this.http.get<string[]>(`${API_URL}/get-favorites`, { params }).subscribe(favs => {
      this.favoritesSubject.next(favs || []);
    });
  }

  /** Add a song to favorites */
  addToFavorites(userId: string, songId: string): Observable<any> {
    return this.http.post(`${API_URL}/add-favorite`, { userId, songId }, httpOptions).pipe(
      tap(() => {
        // Ensure favorites list is up to date
        this.loadFavorites(userId);
      })
    );
  }

  /** Remove a song from favorites */
  removeFromFavorites(userId: string, songId: string): Observable<any> {
    return this.http.request('delete', `${API_URL}/remove-favorite`, {
      body: { userId, songId },
      ...httpOptions
    }).pipe(
      tap(() => {
        // Refresh favorites list from server after removal
        this.loadFavorites(userId);
      })
    );
  }

  /** Add song to recently played — kept as is */
  addToRecentlyPlayed(userId: string, songId: string): Observable<any> {
    return this.http.post(`${API_URL}/add-recently`, { userId, songId }, httpOptions);
  }
}
