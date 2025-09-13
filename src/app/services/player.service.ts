import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from './song.service';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private audio = new Audio();
  private playlist: Song[] = [];
  private currentIndex = -1;
  private resumeTime = 0;
  private isShuffle = false;
  private isLoop = false;

  private currentSongSubject = new BehaviorSubject<Song | null>(null);
  currentSong$ = this.currentSongSubject.asObservable();

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  isPlaying$ = this.isPlayingSubject.asObservable();

  private currentTimeSubject = new BehaviorSubject<number>(0);
  currentTime$ = this.currentTimeSubject.asObservable();

  private volumeSubject = new BehaviorSubject<number>(1);
  volume$ = this.volumeSubject.asObservable();

  constructor() {
    this.audio.addEventListener('timeupdate', () => {
      this.currentTimeSubject.next(this.audio.currentTime);
    });
    this.audio.addEventListener('ended', () => {
      this.next();
    });
  }

  setPlaylist(songs: Song[], startIndex: number = 0): void {
    this.playlist = songs;
    this.currentIndex = startIndex;
    this.play(this.playlist[startIndex]);
  }

  play(song: Song): void {
    const index = this.playlist.findIndex(s => s._id === song._id);
    if (index !== -1) this.currentIndex = index;

    const isSameSong = this.currentSongSubject.value?._id === song._id;

    if (isSameSong && !this.audio.paused) {
      this.pause();
      return;
    }

    if (song.fileUrl) {
      if (!isSameSong) {
        this.audio.src = song.fileUrl;
        this.audio.load();
        this.resumeTime = 0;
      }

      this.audio.play().then(() => {
        if (this.resumeTime > 0 && isSameSong) {
          this.audio.currentTime = this.resumeTime;
        }
        this.currentSongSubject.next(song);
        this.isPlayingSubject.next(true);
      }).catch(err => console.error('Audio play error:', err));
    }
  }

  pause(): void {
    this.resumeTime = this.audio.currentTime;
    this.audio.pause();
    this.isPlayingSubject.next(false);
  }

  togglePlayPause(song: Song): void {
    if (this.isPlaying(song)) {
      this.pause();
    } else {
      this.play(song);
    }
  }

  isPlaying(song: Song): boolean {
    return this.currentSongSubject.value?._id === song._id && !this.audio.paused;
  }

  next(): void {
    if (!this.playlist.length) return;
    this.currentIndex = this.isShuffle
      ? Math.floor(Math.random() * this.playlist.length)
      : (this.currentIndex + 1) % this.playlist.length;
    this.resumeTime = 0;
    this.play(this.playlist[this.currentIndex]);
  }

  previous(): void {
    if (!this.playlist.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.resumeTime = 0;
    this.play(this.playlist[this.currentIndex]);
  }

  seekTo(seconds: number): void {
    this.audio.currentTime = seconds;
    this.resumeTime = seconds;
  }

  setVolume(volume: number): void {
    this.audio.volume = volume;
    this.volumeSubject.next(volume);
  }

  toggleShuffle(): void {
    this.isShuffle = !this.isShuffle;
  }

  toggleLoop(): void {
    this.isLoop = !this.isLoop;
    this.audio.loop = this.isLoop;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getCurrentSong(): Song | null {
    return this.currentSongSubject.value;
  }

  getDuration(): number {
    return this.audio.duration || 0;
  }
}
