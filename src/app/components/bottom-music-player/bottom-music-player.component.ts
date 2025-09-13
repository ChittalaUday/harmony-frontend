import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { Song } from '../../services/song.service';
import { PlayerService } from '../../services/player.service';
import { FormatDurationPipe } from '../../pipes/format-duration.pipe';
import { MusicService } from '../../services/music.service';

@Component({
  selector: 'app-bottom-music-player',
  standalone: true,
  imports: [NgIf, FormatDurationPipe],
  templateUrl: './bottom-music-player.component.html',
  styleUrls: ['./bottom-music-player.component.css']
})
export class BottomMusicPlayerComponent implements OnInit, OnDestroy {
  currentSong: Song | null = null;
  isPlaying = false;
  progress = 0;
  duration = 0;
  currentTime = 0;
  isCounted = false; // Prevent multiple play counts for the same song

  private subscriptions: Subscription[] = [];

  constructor(
    public audioPlayerService: PlayerService,
    private musicService: MusicService
  ) {}

  ngOnInit(): void {

    this.subscriptions.push(
      this.audioPlayerService.currentSong$.subscribe((song) => {
        this.currentSong = song;
        this.isCounted = false; // Reset when a new song is selected
      }),

      this.audioPlayerService.currentTime$.subscribe((time) => {
        this.currentTime = time;
      }),

      this.audioPlayerService.isPlaying$.subscribe((playing) => {
        this.isPlaying = playing;
      }),

      this.audioPlayerService.currentTime$.subscribe((currentTime) => {
        const dur = this.audioPlayerService.getDuration();
        this.duration = dur;
        this.progress = dur ? (currentTime / dur) * 100 : 0;
      })
    );
  }

  togglePlayPause(): void {
    if (this.currentSong) {
      if (!this.isCounted) {
        this.musicService.playSong(this.currentSong._id || "").subscribe(() => {
          // Play count updated successfully
          this.isCounted = true;
        });
      }
      this.audioPlayerService.togglePlayPause(this.currentSong);
      this.audioPlayerService.isPlaying$.subscribe((playing) => {
        this.isPlaying = playing;
      });
    }
  }

  skipToNext(): void {
    this.audioPlayerService.next();
  }

  skipToPrevious(): void {
    this.audioPlayerService.previous();
  }

  toggleShuffle(): void {
    this.audioPlayerService.toggleShuffle();
  }

  toggleLoop(): void {
    this.audioPlayerService.toggleLoop();
  }

  seek(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    const dur = this.audioPlayerService.getDuration();
    if (!isNaN(value) && dur) {
      this.audioPlayerService.seekTo((value / 100) * dur);
    }
  }

  setVolume(event: Event): void {
    const input = event.target as HTMLInputElement;
    const volume = parseFloat(input.value);
    if (!isNaN(volume)) {
      this.audioPlayerService.setVolume(volume);
    }
  }

  get songTitle(): string {
    return this.currentSong?.title ?? 'No song playing';
  }

  get artist(): string {
    return this.currentSong?.artist ?? '';
  }

  get albumArtwork(): string {
    return this.currentSong?.coverImageUrl ?? 'https://via.placeholder.com/48';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
