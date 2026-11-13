export interface Livre {
  numero?: number;
  titre: string;
  auteur: string;
  categorie: string;
  dateAjout?: string;
  disponible?: boolean;
}

export interface Membre {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

export interface Emprunt {
  id: number;
  livre: Livre;
  membre: Membre;
  dateEmprunt: string;
  dateRetourPrevue: string;
  dateRetour: string | null;
  statut: string; // EN_COURS | RETOURNE
  processInstanceKey: number | null;
}

export interface EmpruntRequest {
  livreId: number;
  membreId: number;
  dureeJours: number;
}

/** Tâche « Retour » en attente dans Camunda. */
export interface TacheRetour {
  userTaskKey: number;
  tache: string;
  processInstanceKey: number;
  creeLe: string;
  emprunt?: Emprunt;
}

/** Utilisateur connecté. */
export interface Compte {
  nom: string;
  prenom: string;
  email: string;
}
