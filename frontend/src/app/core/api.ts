import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_URL } from './config';
import { Emprunt, EmpruntRequest, Livre, Membre, TacheRetour } from './models';

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);

  /** Nombre de retours en attente (affiché dans le menu). */
  readonly pending = signal(0);

  // ----- Livres -----
  livres(titre?: string) {
    const params = titre ? new HttpParams().set('titre', titre) : undefined;
    return this.http.get<Livre[]>(`${API_URL}/livres/list`, { params });
  }
  livre(numero: number) {
    return this.http.get<Livre>(`${API_URL}/livres/${numero}`);
  }
  creerLivre(l: Livre) {
    return this.http.post<Livre>(`${API_URL}/livres`, l);
  }
  modifierLivre(numero: number, l: Livre) {
    return this.http.put<Livre>(`${API_URL}/livres/${numero}`, l);
  }
  supprimerLivre(numero: number) {
    return this.http.delete<void>(`${API_URL}/livres/${numero}`);
  }

  // ----- Membres -----
  membres() {
    return this.http.get<Membre[]>(`${API_URL}/membres/list`);
  }
  creerMembre(m: Membre) {
    return this.http.post<Membre>(`${API_URL}/membres`, m);
  }

  // ----- Emprunts -----
  emprunts() {
    return this.http.get<Emprunt[]>(`${API_URL}/emprunts/list`);
  }
  /** Crée l'emprunt : le backend démarre automatiquement le processus Camunda. */
  creerEmprunt(req: EmpruntRequest) {
    return this.http.post<Emprunt>(`${API_URL}/emprunts`, req);
  }
  /** Liste des tâches « Retour » en attente, fournie par Camunda. */
  aTraiter() {
    return this.http
      .get<TacheRetour[]>(`${API_URL}/emprunts/a-traiter`)
      .pipe(tap((l) => this.pending.set(l.length)));
  }
  /** Termine la tâche « Retour » dans Camunda et clôture l'emprunt. */
  retour(userTaskKey: number, processInstanceKey: number) {
    return this.http.post<Emprunt>(
      `${API_URL}/emprunts/retour/${userTaskKey}/${processInstanceKey}`,
      {},
    );
  }
}
