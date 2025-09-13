import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, NavigationEnd, Router } from '@angular/router';
import { PlaylistService, Playlist } from '../../services/playlist.service';
import { SongService, Song } from '../../services/song.service';
import { Subscription, filter } from 'rxjs';
import { FormatDurationPipe } from '../../pipes/format-duration.pipe';
import { PlayerService } from '../../services/player.service';
import { SnackbarService } from '../../services/snackbar.service';  // Import SnackbarService

@Component({
  standalone: true,
  imports: [CommonModule, FormatDurationPipe, RouterModule],
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit, OnDestroy {
  playlist: Playlist | null = null;
  songs: (Song & { isPlaying?: boolean })[] = [];
  loading = true;
  error: string | null = null;
  totalDuration = 0;
  Id = "";

  private routeSub?: Subscription;
  private navigationSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playlistService: PlaylistService,
    private songService: SongService,
    private playerService: PlayerService,
    private snackBarService: SnackbarService  // Inject SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadPlaylistData();
    this.navigationSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.router.url.includes('/playlist/')) {
        this.refreshData();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.navigationSub) this.navigationSub.unsubscribe();
  }

  refreshData(): void {
    this.loading = true;
    this.error = null;
    this.songs = [];
    this.loadPlaylistData();
  }

  loadPlaylistData(): void {
    const playlistId = this.route.snapshot.paramMap.get('id');
    this.Id = playlistId || "";
    if (playlistId) {
      this.fetchPlaylist(playlistId);
    } else {
      this.error = 'No playlist ID provided';
      this.loading = false;
      this.snackBarService.open('No playlist ID provided');
    }
  }

  fetchPlaylist(id: string): void {
    this.playlistService.getPlaylistById(id).subscribe(
      (playlist) => {
        this.playlist = playlist;
        this.fetchSongs(playlist.songIds);
        this.snackBarService.open(`Playlist "${playlist.name}" loaded successfully`);
      },
      (error) => {
        this.error = 'Failed to load playlist';
        this.loading = false;
        this.snackBarService.open('Failed to load playlist');
      }
    );
  }

  fetchSongs(songIds: string[]): void {
    if (!songIds || songIds.length === 0) {
      this.songs = [];
      this.loading = false;
      return;
    }

    const requests = songIds.map(id => this.songService.getSongDetails(id).toPromise());

    Promise.all(requests)
      .then(responses => {
        this.songs = responses
          .filter((r): r is { success: boolean; data: Song } => !!r && r.success && !!r.data)
          .map(r => ({ ...r.data, isPlaying: false }));
        this.calculateTotalDuration();
        this.snackBarService.open('Songs loaded successfully');

      })
      .catch(() => {
        this.error = 'Failed to load songs';
        this.snackBarService.open('Failed to load songs');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  calculateTotalDuration(): void {
    let totalSeconds = 0;
    this.songs.forEach(song => {
      if (typeof song.duration === 'number') totalSeconds += song.duration;
    });
    this.totalDuration = totalSeconds;
  }
  playSong(song: Song & { isPlaying?: boolean }): void {
    // Set the isPlaying state to true for the clicked song
    this.songs.forEach(s => s.isPlaying = false);  // Reset all songs' isPlaying to false
    song.isPlaying = true;

    this.playerService.setPlaylist(this.songs, this.songs.indexOf(song));

    // Play the selected song
    this.playerService.play(song);

    // Show a snackbar message
    this.snackBarService.open(`Playing "${song.title}"`);
  }


  playAll(): void {
    if (this.songs.length > 0) {
      this.playSong(this.songs[0]);
    }
  }

  deleteSong(index: number): void {
    const songToRemove = this.songs[index];

    if (confirm(`Remove "${songToRemove.title}" from this playlist?`)) {
      // Remove the song from the songs array
      this.songs.splice(index, 1);

      // Also remove the song ID from the playlist's songIds array
      let songIdIndex: number | undefined;
      if (this.playlist?.songIds) {
        songIdIndex = this.playlist.songIds.indexOf(songToRemove._id || '');
        if (songIdIndex !== -1) {
          this.playlist.songIds.splice(songIdIndex, 1);
        }
      }

      // Update the total duration after song removal
      this.calculateTotalDuration();

      // Call the service to remove the song from the backend
      if (this.playlist?.songIds && songIdIndex !== undefined) {
        this.playlistService.removeSongsFromPlaylist(this.Id, [songToRemove._id || '']).subscribe(
          () => {
            this.snackBarService.open(`Removed "${songToRemove.title}" from playlist`);
            // After song removal, update the playlist in PlayerService
            this.playerService.setPlaylist(this.songs, 0);
          },
          () => {
            this.snackBarService.open('Failed to remove song from playlist');
            // If removal fails, restore the song
            this.songs.splice(index, 0, songToRemove);  // Re-add the song to the array
            if (this.playlist?.songIds) {
              this.playlist.songIds.splice(songIdIndex, 0, songToRemove._id || '');
            }
          }
        );
      }
    }
  }
}
