import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song } from './song.service';
import { environment } from '../../environments/environment';

export interface Album {
  _id: string;
  name: string;
  artist: string;
  songs: Song[];
  coverImageUrl: String;
}

export interface TrendingSong extends Song {
  _id: string;
  title: string;
  artist: string;
  playCount: number;
  songId: string;
  coverImageUrl: string;
  fileUrl: string;
}


@Injectable({
  providedIn: 'root',
})
export class MusicService {
  private apiUrl = environment.apiUrl + '/music'; // Adjusted the API URL to match your backend route

  constructor(private http: HttpClient) { }
  /** Play a song (increases play count and tracks trending) */
  playSong(songId: string, userId?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/play/${songId}`, { userId });
  }

  /** Get trending songs */
  getTrendingSongs(): Observable<TrendingSong[]> {
    return this.http.get<TrendingSong[]>(`${this.apiUrl}/trending`);
  }

  /** Get all songs in an album */
  getAlbumSongs(albumId: string): Observable<Album> {
    return this.http.get<Album>(`${this.apiUrl}/album/${albumId}`);
  }

  getAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.apiUrl}/albums`);
  }

  /** Delete a song from the database */
  deleteSong(songId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${songId}`);
  }

  /** Automatically generate albums from all songs */
  generateAlbumsFromSongs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/generateAlbum`);
  }
}
