import { Component, OnInit, Input } from '@angular/core';
import { SongService } from '../../services/song.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-song-recommendations',
  imports: [CommonModule],
  templateUrl: './song-recommendations.component.html',
  styleUrls: ['./song-recommendations.component.css'],
})
export class SongRecommendationsComponent implements OnInit {
  @Input() songId: string = '';  // Accept song ID as an input property
  recommendations: any[] = [];
  errorMessage: string = '';

  constructor(private recommendationService: SongService) {}

  ngOnInit(): void {
    if (this.songId) {
      this.getRecommendations();
    }
  }

  // Get recommendations for a specific song
  getRecommendations(): void {
    this.recommendationService.getRecommendations(this.songId).subscribe(
      (data) => {
        this.recommendations = data;
      },
      (error) => {
        this.errorMessage = 'Failed to load recommendations. Please try again later.';
        console.error('Error loading recommendations:', error);
      }
    );
  }

  // Optionally add playSong method to handle playing the song
  playSong(songId: string): void {
    console.log('Playing song with ID:', songId);
    // Add logic for playing the song (e.g., via an audio player)
  }
}
