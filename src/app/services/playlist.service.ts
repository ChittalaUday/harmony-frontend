import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface Playlist {
  _id?: string;
  name: string;
  description?: string;
  userId: string;
  songIds: string[];
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private baseUrl = environment.apiUrl + '/playlist';

  constructor(private http: HttpClient) { }

  createPlaylist(playlist: Playlist): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.baseUrl}`, playlist);
  }

  getUserPlaylists(userId: string): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.baseUrl}s/${userId}`);
  }

  getPlaylistById(playlistId: string): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.baseUrl}/${playlistId}`);
  }

  addSongsToPlaylist(playlistId: string, songIds: string[]): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.baseUrl}/${playlistId}/add-song`, { songIds });
  }

  removeSongsFromPlaylist(playlistId: string, songIds: string[]): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.baseUrl}/${playlistId}/remove-song`, { songIds });
  }
}
