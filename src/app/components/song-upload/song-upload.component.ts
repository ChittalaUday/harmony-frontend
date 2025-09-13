import { Component } from '@angular/core';
import { SongService } from '../../services/song.service';
import { CommonModule } from '@angular/common';
import { HttpEventType,HttpEvent } from '@angular/common/http';

@Component({
  selector: 'app-upload-song',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './song-upload.component.html',
  styleUrls: ['./song-upload.component.css']
})
export class UploadSongComponent {
  showUploadPopup = false;
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  uploadMessage = '';

  constructor(private songService: SongService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  uploadSong() {
    if (!this.selectedFile) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      this.uploadMessage = 'Authentication token missing.';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadMessage = 'Uploading...';

    this.songService.uploadSong(this.selectedFile, token).subscribe({
      next: (event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              this.uploadProgress = Math.round((event.loaded / event.total) * 100);
            }
            break;

          case HttpEventType.Response:
            if (event.status === 200) {
              this.uploadProgress = 100;
              this.uploadMessage = 'Upload successful!';
            } else {
              this.uploadMessage = `Upload finished but unexpected status: ${event.status}`;
            }
            this.isUploading = false;
            break;
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadMessage = 'Upload failed. Please try again.';
        console.error('Upload error:', error);
      }
    });
  }


  closeUploadPopup() {
    this.showUploadPopup = false;
    this.selectedFile = null;
    this.uploadMessage = '';
    this.uploadProgress = 0;
    this.isUploading = false;
  }
}
