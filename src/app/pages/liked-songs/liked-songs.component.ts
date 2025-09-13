import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { SongService, Song } from '../../services/song.service';
import { Observable, forkJoin } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-liked-songs',
  imports: [CommonModule],
  templateUrl: './liked-songs.component.html',
  styleUrls: ['./liked-songs.component.css']
})
export class LikedSongsComponent implements OnInit {
  loading = true;
  likedSongs: Song[] = [];
  parsed = localStorage.getItem('user') || '';
  userId = JSON.parse(this.parsed)._id;
  constructor(private userService: UserService, private songService: SongService) {}

  ngOnInit(): void {
    this.loadLikedSongs();
  }

  loadLikedSongs(): void {
    this.userService.loadFavorites(this.userId);
    this.userService.favorites$.subscribe(ids => {
      if (ids.length === 0) {
        this.likedSongs = [];
        this.loading = false;
        return;
      }
      const songRequests = ids.map((id: any) => {
        const songId = typeof id === 'string' ? id : id?._id;
        console.log('Cleaned Song ID:', songId);
        return this.songService.getSongDetails(songId);
      });

      forkJoin(songRequests).subscribe(results => {
        this.likedSongs = results.map(res => res.data);
        this.loading = false;
      });
    });
  }

  removeFromLiked(songId: string): void {
    this.userService.removeFromFavorites(this.userId, songId).subscribe(() => {
      this.likedSongs = this.likedSongs.filter(song => song._id !== songId);
    });
  }
}
