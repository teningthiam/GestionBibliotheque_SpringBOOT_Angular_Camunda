import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth-guard';
import { Shell } from './layout/shell';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Connexion · Bibliothèque',
    loadComponent: () => import('./pages/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'livres' },
      {
        path: 'livres',
        title: 'Catalogue · Bibliothèque',
        loadComponent: () => import('./pages/livres').then((m) => m.Livres),
      },
      {
        path: 'livres/:numero',
        title: 'Détail du livre · Bibliothèque',
        loadComponent: () => import('./pages/livre-detail').then((m) => m.LivreDetail),
      },
      {
        path: 'emprunt',
        title: 'Nouvel emprunt · Bibliothèque',
        loadComponent: () => import('./pages/emprunt').then((m) => m.NouvelEmprunt),
      },
      {
        path: 'emprunts',
        title: 'Emprunts · Bibliothèque',
        loadComponent: () => import('./pages/emprunts').then((m) => m.Emprunts),
      },
      {
        path: 'finaliser',
        title: 'Finaliser un emprunt · Bibliothèque',
        loadComponent: () => import('./pages/finaliser').then((m) => m.Finaliser),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
