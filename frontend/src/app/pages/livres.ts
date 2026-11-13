import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Api } from '../core/api';
import { Livre } from '../core/models';
import { Toast } from '../core/toast';
import { messageErreur } from '../core/utils';
import { BookCover } from '../shared/book-cover';
import { Icon } from '../shared/icon';
import { LivreForm } from '../shared/livre-form';
import { Modal } from '../shared/modal';

type Filtre = 'tous' | 'dispo' | 'empruntes';

@Component({
  selector: 'app-livres',
  imports: [RouterLink, FormsModule, Icon, BookCover, Modal, LivreForm],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Catalogue</p>
          <h1>Les ouvrages de la bibliothèque</h1>
          @if (!loading() && !erreur()) {
            <p class="lede">
              {{ livres().length }} ouvrage{{ livres().length > 1 ? 's' : '' }} ·
              {{ disponibles() }} disponible{{ disponibles() > 1 ? 's' : '' }} à l'emprunt
            </p>
          }
        </div>
        <div class="actions">
          <button class="btn btn-ghost" type="button" (click)="ajout.set(true)"><app-icon name="plus" [size]="18" /> Ajouter un livre</button>
          <a class="btn btn-primary" routerLink="/emprunt"><app-icon name="book" [size]="18" /> Nouvel emprunt</a>
        </div>
      </header>

      <div class="toolbar">
        <div class="input-icon search">
          <app-icon name="search" [size]="18" />
          <input class="input" type="search" placeholder="Rechercher un titre, un auteur…" aria-label="Rechercher"
                 [ngModel]="query()" (ngModelChange)="query.set($event)" />
        </div>
        <div class="chips">
          <button type="button" class="chip" [class.on]="filtre() === 'tous'" (click)="filtre.set('tous')">Tous</button>
          <button type="button" class="chip" [class.on]="filtre() === 'dispo'" (click)="filtre.set('dispo')">Disponibles</button>
          <button type="button" class="chip" [class.on]="filtre() === 'empruntes'" (click)="filtre.set('empruntes')">Empruntés</button>
        </div>
      </div>

      @if (categories().length > 1) {
        <div class="chips cats">
          <button type="button" class="chip" [class.on]="categorie() === ''" (click)="categorie.set('')">Toutes catégories</button>
          @for (c of categories(); track c) {
            <button type="button" class="chip" [class.on]="categorie() === c" (click)="categorie.set(c)">{{ c }}</button>
          }
        </div>
      }

      @if (loading()) {
        <div class="grid">
          @for (n of [1,2,3,4,5,6,7,8]; track n) {
            <div><div class="skeleton sk-cover"></div><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div></div>
          }
        </div>
      } @else if (erreur()) {
        <div class="alert">
          <app-icon name="alert" />
          <div><strong>Chargement impossible</strong>{{ erreur() }}
            <div class="retry"><button class="btn btn-sm btn-ghost" type="button" (click)="charger()"><app-icon name="refresh" [size]="16" /> Réessayer</button></div>
          </div>
        </div>
      } @else if (filtres().length === 0) {
        <div class="card empty">
          <div class="ico"><app-icon name="book" [size]="28" /></div>
          @if (livres().length === 0) {
            <h3>Le catalogue est vide</h3>
            <p>Ajoutez votre premier livre pour commencer à gérer les emprunts.</p>
            <button class="btn btn-primary" type="button" (click)="ajout.set(true)"><app-icon name="plus" [size]="18" /> Ajouter un livre</button>
          } @else {
            <h3>Aucun résultat</h3>
            <p>Aucun livre ne correspond à votre recherche ou à vos filtres.</p>
            <button class="btn btn-ghost" type="button" (click)="reinitialiser()">Réinitialiser les filtres</button>
          }
        </div>
      } @else {
        <div class="grid">
          @for (l of filtres(); track l.numero; let i = $index) {
            <a class="book" [routerLink]="['/livres', l.numero]" [style.--i]="i < 14 ? i : 14">
              <app-book-cover [titre]="l.titre" [auteur]="l.auteur" />
              <div class="meta">
                <h3>{{ l.titre }}</h3>
                <p>{{ l.auteur }}</p>
                <div class="foot">
                  <span class="badge" [class.ok]="l.disponible" [class.busy]="!l.disponible">{{ l.disponible ? 'Disponible' : 'Emprunté' }}</span>
                  <span class="cat">{{ l.categorie }}</span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>

    @if (ajout()) {
      <app-modal title="Ajouter un livre" (closed)="ajout.set(false)">
        <app-livre-form [categories]="categories()" (saved)="apresAjout($event)" (cancel)="ajout.set(false)" />
      </app-modal>
    }
  `,
  styles: `
    .toolbar { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; margin-bottom: 14px; }
    .search { flex: 1; min-width: 260px; max-width: 460px; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .cats { margin-bottom: 26px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 34px 26px; margin-top: 26px; }
    .cats + .grid { margin-top: 0; }
    .book { display: block; animation: rise .5s var(--ease) both; animation-delay: calc(var(--i) * 40ms); }
    .book app-book-cover { transition: transform .3s var(--ease), filter .3s; }
    .book:hover app-book-cover { transform: translateY(-8px) rotate(-.6deg); filter: drop-shadow(0 18px 18px rgba(10,42,33,.18)); }
    .meta { padding: 16px 2px 0; }
    .meta h3 { font-size: 16.5px; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .meta p { color: var(--ink-2); font-size: 14px; margin: 4px 0 11px; }
    .foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
    .cat { font-size: 12.5px; color: var(--ink-3); font-weight: 600; }
    .sk-cover { aspect-ratio: 2/3; border-radius: 8px; }
    .sk-line { height: 14px; margin-top: 14px; }
    .sk-line.short { width: 60%; }
    .retry { margin-top: 12px; }
    .alert { margin-top: 26px; }
    @media (max-width: 560px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 26px 16px; } }
  `,
})
export class Livres {
  private api = inject(Api);
  private toast = inject(Toast);

  protected livres = signal<Livre[]>([]);
  protected loading = signal(true);
  protected erreur = signal('');
  protected query = signal('');
  protected filtre = signal<Filtre>('tous');
  protected categorie = signal('');
  protected ajout = signal(false);

  protected disponibles = computed(() => this.livres().filter((l) => l.disponible).length);
  protected categories = computed(() =>
    [...new Set(this.livres().map((l) => l.categorie).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  );
  protected filtres = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.livres().filter((l) => {
      if (this.filtre() === 'dispo' && !l.disponible) return false;
      if (this.filtre() === 'empruntes' && l.disponible) return false;
      if (this.categorie() && l.categorie !== this.categorie()) return false;
      return !q || `${l.titre} ${l.auteur} ${l.categorie}`.toLowerCase().includes(q);
    });
  });

  constructor() {
    this.charger();
  }

  charger() {
    this.loading.set(true);
    this.erreur.set('');
    this.api.livres().subscribe({
      next: (l) => { this.livres.set(l); this.loading.set(false); },
      error: (e) => { this.erreur.set(messageErreur(e)); this.loading.set(false); },
    });
  }

  reinitialiser() {
    this.query.set('');
    this.filtre.set('tous');
    this.categorie.set('');
  }

  apresAjout(l: Livre) {
    this.ajout.set(false);
    this.toast.show(`« ${l.titre} » a été ajouté au catalogue.`);
    this.charger();
  }
}
