import { Injectable, computed, signal } from '@angular/core';
import { COMPTE } from './config';
import { Compte } from './models';

const KEY = 'biblio.session';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly _user = signal<Compte | null>(this.restore());
  readonly user = this._user.asReadonly();
  readonly connecte = computed(() => this._user() !== null);

  login(email: string, password: string): boolean {
    const ok = email.trim().toLowerCase() === COMPTE.email && password === COMPTE.password;
    if (ok) {
      const u: Compte = { prenom: COMPTE.prenom, nom: COMPTE.nom, email: COMPTE.email };
      sessionStorage.setItem(KEY, JSON.stringify(u));
      this._user.set(u);
    }
    return ok;
  }

  logout() {
    sessionStorage.removeItem(KEY);
    this._user.set(null);
  }

  private restore(): Compte | null {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    } catch {
      return null;
    }
  }
}
