import { Component, OnInit } from '@angular/core';
import { MusicService } from '../../services/music.service'; // Import your service
import { TrendingSong, Album } from '../../services/music.service'; // Import the types
import { SongService } from '../../services/song.service'; // Import SongService
import { PlayerService } from '../../services/player.service'; // Import PlayerService
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  storedData: any = null;
  name: string = '';
  trendingSongs: TrendingSong[] = []; // Array to store trending songs
  albums: Album[] = []; // Array to store albums
  songDetails: any[] = []; // Array to store song details for each trending song

  constructor(
    private musicService: MusicService,
    private songService: SongService, // Inject SongService to fetch song details
    private playerService: PlayerService // Inject PlayerService to control playback
  ) {}

  ngOnInit(): void {
    // Fetch user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      this.storedData = JSON.parse(userData);
      console.log(this.storedData);
      this.name = this.storedData.name;
    }

    // Fetch trending songs
    this.musicService.getTrendingSongs().subscribe(
      (songs: TrendingSong[]) => {
        this.trendingSongs = songs;
        console.log('Trending Songs:', this.trendingSongs);

        // Fetch details for each trending song
        this.fetchSongDetails();
      },
      (error) => {
        console.error('Error fetching trending songs:', error);
      }
    );

    // Fetch albums
    this.musicService.getAlbums().subscribe(
      (albums: Album[]) => {
        this.albums = albums; // This will correctly store the array of albums in `this.albums`
        console.log('Albums:', this.albums);
      },
      (error) => {
        console.error('Error fetching albums:', error);
      }
    );
  }

  // Function to fetch song details for each trending song
  fetchSongDetails(): void {
    this.trendingSongs.forEach((song) => {
      this.songService.getSongDetails(song.songId!).subscribe(
        (response) => {
          // Push song details to the array
          this.songDetails.push(response.data);
          console.log('Song Details:', response.data);
        },
        (error) => {
          console.error('Error fetching song details for songId:', song.songId, error);
        }
      );
    });
  }

  // Play or pause a song
  togglePlayPause(song: TrendingSong): void {
    this.playerService.togglePlayPause(song);
  }

  // Check if a song is playing
  isSongPlaying(song: TrendingSong): boolean {
    return this.playerService.isPlaying(song);
  }
}
