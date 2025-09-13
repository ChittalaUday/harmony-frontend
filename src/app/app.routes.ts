import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component'; // Import MainLayoutComponent

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(m => m.RegisterComponent),
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard], // Use AuthGuard to protect these routes
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./pages/search/search.component').then(m => m.SearchComponent),
      },
      {
        path: 'library',
        loadComponent: () =>
          import('./pages/playlists/playlists.component').then(m => m.PlaylistsComponent),
      },
      {
        path: 'liked',
        loadComponent: () =>
          import('./pages/liked-songs/liked-songs.component').then(m => m.LikedSongsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'playlist/:id',
        loadComponent: () =>
        import('./pages/playlist/playlist.component').then(m=>m.PlaylistComponent),
      },
      { path: '**', redirectTo: 'home' },
    ]
  },
];
