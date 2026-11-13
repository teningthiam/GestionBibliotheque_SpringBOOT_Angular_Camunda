import { HttpErrorResponse } from '@angular/common/http';
import { Emprunt } from './models';

export function enRetard(e: Emprunt): boolean {
  if (e.statut !== 'EN_COURS') return false;
  const fin = new Date(e.dateRetourPrevue + 'T23:59:59');
  return fin.getTime() < Date.now();
}

export function etat(e: Emprunt): 'retourne' | 'retard' | 'encours' {
  if (e.statut === 'RETOURNE') return 'retourne';
  return enRetard(e) ? 'retard' : 'encours';
}

export function initiales(nom?: string, prenom?: string): string {
  return ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase() || '?';
}

const INDISPONIBLE = 'Le service est momentanément indisponible. Réessayez dans un instant.';

/**
 * Message affiché à l'utilisateur : jamais de détail technique.
 * Les détails réels sont écrits dans la console du navigateur pour le développeur.
 */
export function messageErreur(err: unknown): string {
  console.error('[API]', err);

  if (err instanceof HttpErrorResponse) {
    // Serveur injoignable (arrêté, mauvais port, bloqué par CORS) : pas de réponse HTTP.
    if (err.status === 0) return INDISPONIBLE;

    // Message métier renvoyé par le backend (ex. « Livre déjà emprunté »), uniquement pour les erreurs 4xx.
    const corps = err.error;
    const message =
      corps && typeof corps === 'object' && !(corps instanceof Error)
        ? (corps as { message?: unknown }).message
        : undefined;
    if (err.status < 500 && typeof message === 'string' && message.trim()) return message;

    if (err.status === 404 || err.status >= 500) return INDISPONIBLE;
    if (err.status === 400) return 'Les informations saisies sont invalides.';
    if (err.status === 401 || err.status === 403) return 'Accès refusé.';
  }
  return 'Une erreur est survenue. Réessayez.';
}
