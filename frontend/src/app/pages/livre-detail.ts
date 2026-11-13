import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { Emprunt, Livre } from '../core/models';
import { Toast } from '../core/toast';
import { etat, messageErreur } from '../core/utils';
import { BookCover } from '../shared/book-cover';
import { Icon } from '../shared/icon';
import { LivreForm } from '../shared/livre-form';
import { Modal } from '../shared/modal';

@Component({
  selector: 'app-livre-detail',
  imports: [RouterLink, DatePipe, Icon, BookCover, Modal, LivreForm],
  template: `
    <div class="page">
      <a class="back" routerLink="/livres"><app-icon name="arrow-left" [size]="18" /> Retour au catalogue</a>

      @if (loading()) {
        <div class="layout">
          <div class="skeleton sk-cover"></div>
          <div><div class="skeleton sk-h"></div><div class="skeleton sk-l"></div><div class="skeleton sk-l short"></div></div>
        </div>
      } @else if (erreur()) {
        <div class="alert"><app-icon name="alert" /><div><strong>Livre introuvable</strong>{{ erreur() }}</div></div>
      } @else if (livre(); as l) {
        <div class="layout">
          <div class="cover-col"><app-book-cover [titre]="l.titre" [auteur]="l.auteur" /></div>

          <div class="info">
            <span class="tag">{{ l.categorie }}</span>
            <h1>{{ l.titre }}</h1>
            <p class="by">par <strong>{{ l.auteur }}</strong></p>

            <div class="status">
              <span class="badge" [class.ok]="l.disponible" [class.busy]="!l.disponible">
                {{ l.disponible ? 'Disponible à l’emprunt' : 'Actuellement emprunté' }}
              </span>
            </div>

            <dl class="facts">
              <div><dt><app-icon name="hash" [size]="16" /> Numéro</dt><dd class="mono">{{ l.numero }}</dd></div>
              <div><dt><app-icon name="calendar" [size]="16" /> Ajouté le</dt><dd>{{ l.dateAjout ? (l.dateAjout | date: 'd MMMM y') : '—' }}</dd></div>
              <div><dt><app-icon name="book" [size]="16" /> Catégorie</dt><dd>{{ l.categorie }}</dd></div>
              <div><dt><app-icon name="list" [size]="16" /> Emprunts</dt><dd>{{ historique().length }}</dd></div>
            </dl>

            <div class="actions">
              @if (l.disponible) {
                <a class="btn btn-gold btn-lg" [routerLink]="['/emprunt']" [queryParams]="{ livre: l.numero }">
                  <app-icon name="book" [size]="20" /> Emprunter ce livre
                </a>
              } @else {
                <a class="btn btn-primary btn-lg" routerLink="/finaliser"><app-icon name="undo" [size]="20" /> Enregistrer le retour</a>
              }
              <button class="btn btn-ghost" type="button" (click)="edition.set(true)"><app-icon name="edit" [size]="17" /> Modifier</button>
              <button class="btn btn-danger" type="button" (click)="suppression.set(true)"><app-icon name="trash" [size]="17" /> Supprimer</button>
            </div>
          </div>
        </div>

        <section class="card hist">
          <div class="hist-head"><h2>Historique des emprunts</h2><span class="muted">{{ historique().length }} au total</span></div>
          @if (historique().length === 0) {
            <p class="none">Ce livre n'a pas encore été emprunté.</p>
          } @else {
            <div class="table-wrap">
              <table class="table">
                <thead><tr><th>Membre</th><th>Emprunté le</th><th>Retour prévu</th><th>Statut</th></tr></thead>
                <tbody>
                  @for (e of historique(); track e.id) {
                    <tr>
                      <td><strong>{{ e.membre.prenom }} {{ e.membre.nom }}</strong><div class="muted">{{ e.membre.email }}</div></td>
                      <td>{{ e.dateEmprunt | date: 'd MMM y' }}</td>
                      <td>{{ e.dateRetourPrevue | date: 'd MMM y' }}</td>
                      <td>
                        @switch (etat(e)) {
                          @case ('retourne') { <span class="badge done">Retourné</span> }
                          @case ('retard') { <span class="badge late">En retard</span> }
                          @default { <span class="badge busy">En cours</span> }
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>

        @if (edition()) {
          <app-modal title="Modifier le livre" (closed)="edition.set(false)">
            <app-livre-form [livre]="l" (saved)="apresEdition()" (cancel)="edition.set(false)" />
          </app-modal>
        }
        @if (suppression()) {
          <app-modal title="Supprimer ce livre ?" (closed)="suppression.set(false)">
            <p class="confirm">« {{ l.titre }} » sera définitivement retiré du catalogue. Cette action est irréversible.</p>
            @if (erreurSuppr()) { <p class="alert"><app-icon name="alert" [size]="18" /><span>{{ erreurSuppr() }}</span></p> }
            <div class="foot">
              <button class="btn btn-ghost" type="button" (click)="suppression.set(false)">Annuler</button>
              <button class="btn btn-danger" type="button" (click)="supprimer(l)">Oui, supprimer</button>
            </div>
          </app-modal>
        }
      }
    </div>
  `,
  styles: `
    .back { display: inline-flex; align-items: center; gap: 8px; color: var(--ink-2); font-weight: 600; font-size: 14px; margin-bottom: 26px; }
    .back:hover { color: var(--g-700); }
    .layout { display: grid; grid-template-columns: 300px 1fr; gap: 56px; align-items: start; margin-bottom: 36px; }
    .cover-col { filter: drop-shadow(0 26px 26px rgba(10,42,33,.2)); }
    .info h1 { font-size: clamp(30px, 4vw, 46px); margin: 14px 0 6px; }
    .by { font-size: 18px; color: var(--ink-2); }
    .status { margin: 20px 0 26px; }
    .facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; margin: 0 0 30px; border: 1px solid var(--line); border-radius: var(--radius); background: #fff; overflow: hidden; }
    .facts > div { padding: 16px 20px; border-bottom: 1px solid var(--line-2); }
    .facts > div:nth-child(odd) { border-right: 1px solid var(--line-2); }
    .facts > div:nth-last-child(-n + 2) { border-bottom: 0; }
    dt { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 4px; }
    dd { margin: 0; font-weight: 600; font-size: 16px; }
    .hist-head { display: flex; align-items: baseline; justify-content: space-between; padding: 22px 24px 16px; }
    .hist-head h2 { font-size: 20px; }
    .none { padding: 8px 24px 34px; color: var(--ink-3); }
    .confirm { color: var(--ink-2); margin-bottom: 20px; }
    .foot { display: flex; justify-content: flex-end; gap: 10px; }
    .alert { margin: 0 0 16px; padding: 12px 14px; }
    .sk-cover { aspect-ratio: 2/3; width: 300px; border-radius: 10px; }
    .sk-h { height: 44px; width: 70%; margin-bottom: 18px; }
    .sk-l { height: 18px; margin-bottom: 12px; width: 90%; }
    .sk-l.short { width: 45%; }
    @media (max-width: 860px) {
      .layout { grid-template-columns: 1fr; gap: 30px; }
      .cover-col { max-width: 240px; }
    }
  `,
})
export class LivreDetail {
  private api = inject(Api);
  private router = inject(Router);
  private toast = inject(Toast);

  numero = input.required<string>();

  protected livre = signal<Livre | null>(null);
  protected emprunts = signal<Emprunt[]>([]);
  protected loading = signal(true);
  protected erreur = signal('');
  protected edition = signal(false);
  protected suppression = signal(false);
  protected erreurSuppr = signal('');
  protected etat = etat;

  protected historique = computed(() =>
    this.emprunts()
      .filter((e) => e.livre?.numero === this.livre()?.numero)
      .sort((a, b) => b.dateEmprunt.localeCompare(a.dateEmprunt)),
  );

  constructor() {
    effect(() => this.charger(Number(this.numero())));
  }

  private charger(n: number) {
    this.loading.set(true);
    this.erreur.set('');
    this.api.livre(n).subscribe({
      next: (l) => { this.livre.set(l); this.loading.set(false); },
      error: (e) => { this.erreur.set(messageErreur(e)); this.loading.set(false); },
    });
    this.api.emprunts().subscribe({ next: (l) => this.emprunts.set(l), error: () => {} });
  }

  apresEdition() {
    this.edition.set(false);
    this.toast.show('Le livre a été mis à jour.');
    this.charger(Number(this.numero()));
  }

  supprimer(l: Livre) {
    this.erreurSuppr.set('');
    this.api.supprimerLivre(l.numero!).subscribe({
      next: () => {
        this.toast.show(`« ${l.titre} » a été supprimé.`);
        this.router.navigateByUrl('/livres');
      },
      error: () => this.erreurSuppr.set('Suppression impossible : ce livre est peut-être lié à des emprunts.'),
    });
  }
}
