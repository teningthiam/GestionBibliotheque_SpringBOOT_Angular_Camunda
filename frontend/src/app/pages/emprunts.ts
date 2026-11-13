import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { Emprunt } from '../core/models';
import { etat, messageErreur } from '../core/utils';
import { BookCover } from '../shared/book-cover';
import { Icon } from '../shared/icon';

type Onglet = 'tous' | 'encours' | 'retard' | 'retourne';

@Component({
  selector: 'app-emprunts',
  imports: [DatePipe, FormsModule, RouterLink, Icon, BookCover],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Suivi</p>
          <h1>Les emprunts</h1>
          <p class="lede">Tous les prêts, leur état et le processus associé.</p>
        </div>
        <div class="actions">
          <button class="btn btn-ghost" type="button" (click)="charger()"><app-icon name="refresh" [size]="17" /> Actualiser</button>
          <a class="btn btn-primary" routerLink="/emprunt"><app-icon name="plus" [size]="18" /> Nouvel emprunt</a>
        </div>
      </header>

      <div class="stats">
        <div class="stat"><span>Total</span><strong>{{ emprunts().length }}</strong></div>
        <div class="stat busy"><span>En cours</span><strong>{{ compte('encours') }}</strong></div>
        <div class="stat late"><span>En retard</span><strong>{{ compte('retard') }}</strong></div>
        <div class="stat ok"><span>Retournés</span><strong>{{ compte('retourne') }}</strong></div>
      </div>

      <div class="toolbar">
        <div class="chips">
          <button type="button" class="chip" [class.on]="onglet() === 'tous'" (click)="onglet.set('tous')">Tous <small>{{ emprunts().length }}</small></button>
          <button type="button" class="chip" [class.on]="onglet() === 'encours'" (click)="onglet.set('encours')">En cours <small>{{ compte('encours') }}</small></button>
          <button type="button" class="chip" [class.on]="onglet() === 'retard'" (click)="onglet.set('retard')">En retard <small>{{ compte('retard') }}</small></button>
          <button type="button" class="chip" [class.on]="onglet() === 'retourne'" (click)="onglet.set('retourne')">Retournés <small>{{ compte('retourne') }}</small></button>
        </div>
        <div class="input-icon search">
          <app-icon name="search" [size]="18" />
          <input class="input" type="search" placeholder="Livre ou membre…" aria-label="Rechercher"
                 [ngModel]="query()" (ngModelChange)="query.set($event)" />
        </div>
      </div>

      <section class="card">
        @if (loading()) {
          <div class="sk-wrap">@for (n of [1,2,3,4,5]; track n) { <div class="skeleton sk-row"></div> }</div>
        } @else if (erreur()) {
          <div class="alert flat"><app-icon name="alert" /><div><strong>Chargement impossible</strong>{{ erreur() }}</div></div>
        } @else if (filtres().length === 0) {
          <div class="empty">
            <div class="ico"><app-icon name="list" [size]="28" /></div>
            <h3>{{ emprunts().length === 0 ? 'Aucun emprunt pour le moment' : 'Aucun résultat' }}</h3>
            <p>{{ emprunts().length === 0 ? 'Créez un premier emprunt pour démarrer le processus.' : 'Modifiez la recherche ou le filtre.' }}</p>
            @if (emprunts().length === 0) { <a class="btn btn-primary" routerLink="/emprunt">Nouvel emprunt</a> }
          </div>
        } @else {
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr><th>Livre</th><th>Membre</th><th>Emprunté le</th><th>Retour prévu</th><th>Statut</th><th>Processus</th><th></th></tr>
              </thead>
              <tbody>
                @for (e of filtres(); track e.id) {
                  <tr>
                    <td>
                      <a class="cell-book" [routerLink]="['/livres', e.livre.numero]">
                        <span class="mini"><app-book-cover [titre]="e.livre.titre" [auteur]="e.livre.auteur" /></span>
                        <div class="txt"><strong>{{ e.livre.titre }}</strong><span>{{ e.livre.auteur }}</span></div>
                      </a>
                    </td>
                    <td><strong>{{ e.membre.prenom }} {{ e.membre.nom }}</strong><div class="muted">{{ e.membre.email }}</div></td>
                    <td class="mono">{{ e.dateEmprunt | date: 'd MMM y' }}</td>
                    <td class="mono">{{ e.dateRetourPrevue | date: 'd MMM y' }}
                      @if (e.dateRetour) { <div class="muted">rendu le {{ e.dateRetour | date: 'd MMM' }}</div> }
                    </td>
                    <td>
                      @switch (etat(e)) {
                        @case ('retourne') { <span class="badge done">Retourné</span> }
                        @case ('retard') { <span class="badge late">En retard</span> }
                        @default { <span class="badge busy">En cours</span> }
                      }
                    </td>
                    <td>
                      @if (e.processInstanceKey) { <code class="key" [title]="'' + e.processInstanceKey">…{{ ('' + e.processInstanceKey).slice(-6) }}</code> }
                      @else { <span class="muted">—</span> }
                    </td>
                    <td class="end">
                      @if (e.statut === 'EN_COURS') { <a class="btn btn-sm btn-ghost" routerLink="/finaliser">Finaliser</a> }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>
  `,
  styles: `
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 26px; }
    .stat { padding: 18px 22px; background: #fff; border: 1px solid var(--line); border-radius: var(--radius); border-top: 3px solid var(--line); }
    .stat span { font-size: 12.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); }
    .stat strong { display: block; font-family: var(--font-display); font-size: 36px; font-weight: 600; margin-top: 4px; line-height: 1.1; }
    .stat.busy { border-top-color: var(--gold); } .stat.late { border-top-color: var(--red); } .stat.late strong { color: var(--red); }
    .stat.ok { border-top-color: var(--g-600); }
    .toolbar { display: flex; justify-content: space-between; gap: 14px; flex-wrap: wrap; align-items: center; margin-bottom: 18px; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .search { width: 300px; max-width: 100%; }
    .cell-book { text-decoration: none; min-width: 190px; }
    .cell-book .txt strong { display: block; color: var(--ink); }
    .table td, .table th { padding-left: 14px; padding-right: 14px; }
    .mono { white-space: nowrap; }
    .cell-book:hover strong { color: var(--g-700); }
    .key { font-family: ui-monospace, Consolas, monospace; font-size: 12.5px; padding: 3px 8px; background: var(--paper); border-radius: 6px; color: var(--ink-2); }
    .end { text-align: right; }
    .sk-wrap { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
    .sk-row { height: 58px; }
    .alert.flat { border: 0; margin: 0; }
    @media (max-width: 760px) { .stats { grid-template-columns: repeat(2, 1fr); } }
  `,
})
export class Emprunts {
  private api = inject(Api);

  protected emprunts = signal<Emprunt[]>([]);
  protected loading = signal(true);
  protected erreur = signal('');
  protected onglet = signal<Onglet>('tous');
  protected query = signal('');
  protected etat = etat;

  protected filtres = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.emprunts()
      .filter((e) => this.onglet() === 'tous' || etat(e) === this.onglet())
      .filter((e) => !q || `${e.livre.titre} ${e.livre.auteur} ${e.membre.prenom} ${e.membre.nom} ${e.membre.email}`.toLowerCase().includes(q))
      .sort((a, b) => b.id - a.id);
  });

  constructor() {
    this.charger();
  }

  compte(o: Exclude<Onglet, 'tous'>) {
    return this.emprunts().filter((e) => etat(e) === o).length;
  }

  charger() {
    this.loading.set(true);
    this.erreur.set('');
    this.api.emprunts().subscribe({
      next: (l) => { this.emprunts.set(l); this.loading.set(false); },
      error: (e) => { this.erreur.set(messageErreur(e)); this.loading.set(false); },
    });
  }
}
