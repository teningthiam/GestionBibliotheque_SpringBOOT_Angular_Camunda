import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { Emprunt as EmpruntModel, Livre, Membre } from '../core/models';
import { Toast } from '../core/toast';
import { initiales, messageErreur } from '../core/utils';
import { BookCover } from '../shared/book-cover';
import { Icon } from '../shared/icon';
import { Modal } from '../shared/modal';
import { ProcessSteps } from '../shared/process-steps';

@Component({
  selector: 'app-nouvel-emprunt',
  imports: [FormsModule, RouterLink, DatePipe, Icon, BookCover, Modal, ProcessSteps],
  template: `
    <div class="page">
      @if (cree(); as e) {
        <!-- ===== Confirmation ===== -->
        <div class="done card">
          <div class="big-check"><app-icon name="check" [size]="38" [stroke]="2.6" /></div>
          <p class="eyebrow">Emprunt n° {{ e.id }}</p>
          <h1>Emprunt enregistré</h1>
          <p class="lede">
            « {{ e.livre.titre }} » est confié à <strong>{{ e.membre.prenom }} {{ e.membre.nom }}</strong>
            jusqu'au <strong>{{ e.dateRetourPrevue | date: 'd MMMM y' }}</strong>.
          </p>

          <div class="proc">
            <div class="proc-head">
              <span><app-icon name="flow" [size]="17" /> Processus Camunda démarré</span>
              <code>{{ e.processInstanceKey }}</code>
            </div>
            <app-process-steps [stage]="2" [email]="e.membre.email" />
          </div>

          <div class="actions center">
            <a class="btn btn-primary" routerLink="/emprunts">Voir les emprunts</a>
            <a class="btn btn-ghost" routerLink="/finaliser">Finaliser un retour</a>
            <button class="btn btn-ghost" type="button" (click)="recommencer()">Nouvel emprunt</button>
          </div>
        </div>
      } @else {
        <header class="page-head">
          <div>
            <p class="eyebrow">Prêt</p>
            <h1>Nouvel emprunt</h1>
            <p class="lede">Choisissez un livre disponible et le membre qui l'emprunte. Le processus démarre automatiquement.</p>
          </div>
        </header>

        <div class="layout">
          <div class="steps-col">
            <!-- 1. Livre -->
            <section class="card block">
              <h2><span class="n">1</span> Le livre</h2>
              <div class="input-icon">
                <app-icon name="search" [size]="18" />
                <input class="input" type="search" placeholder="Rechercher parmi les livres disponibles…" aria-label="Rechercher un livre"
                       [ngModel]="recherche()" (ngModelChange)="recherche.set($event)" />
              </div>

              @if (chargement()) {
                <div class="skeleton sk-list"></div>
              } @else if (erreurChargement()) {
                <p class="alert"><app-icon name="alert" [size]="18" /><span>{{ erreurChargement() }}</span></p>
              } @else if (disponibles().length === 0) {
                <p class="none">Aucun livre disponible pour le moment.</p>
              } @else {
                <ul class="picker" role="listbox" aria-label="Livres disponibles">
                  @for (l of disponibles(); track l.numero) {
                    <li role="option" [attr.aria-selected]="livreId() === l.numero">
                      <button type="button" class="row" [class.sel]="livreId() === l.numero" (click)="livreId.set(l.numero!)">
                        <span class="mini"><app-book-cover [titre]="l.titre" [auteur]="l.auteur" /></span>
                        <span class="t"><strong>{{ l.titre }}</strong><small>{{ l.auteur }} · {{ l.categorie }}</small></span>
                        <span class="tick"><app-icon name="check" [size]="16" [stroke]="2.6" /></span>
                      </button>
                    </li>
                  } @empty { <li class="none">Aucun résultat.</li> }
                </ul>
              }
            </section>

            <!-- 2. Membre -->
            <section class="card block">
              <h2><span class="n">2</span> Le membre</h2>
              <div class="member-row">
                <select class="select" aria-label="Membre" [ngModel]="membreId()" (ngModelChange)="membreId.set($event)">
                  <option [ngValue]="null">Sélectionner un membre…</option>
                  @for (m of membres(); track m.id) {
                    <option [ngValue]="m.id">{{ m.prenom }} {{ m.nom }} — {{ m.email }}</option>
                  }
                </select>
                <button class="btn btn-ghost" type="button" (click)="ouvrirMembre()"><app-icon name="plus" [size]="17" /> Nouveau membre</button>
              </div>
            </section>

            <!-- 3. Durée -->
            <section class="card block">
              <h2><span class="n">3</span> La durée du prêt</h2>
              <div class="seg" role="radiogroup" aria-label="Durée">
                @for (d of durees; track d) {
                  <button type="button" role="radio" [attr.aria-checked]="duree() === d" [class.on]="duree() === d" (click)="duree.set(d)">
                    <strong>{{ d }}</strong><small>jours</small>
                  </button>
                }
              </div>
            </section>
          </div>

          <!-- Récapitulatif -->
          <aside class="summary card">
            <h2>Récapitulatif</h2>

            @if (livre(); as l) {
              <div class="sum-book">
                <div class="mini lg"><app-book-cover [titre]="l.titre" [auteur]="l.auteur" /></div>
                <div><strong>{{ l.titre }}</strong><span>{{ l.auteur }}</span></div>
              </div>
            } @else {
              <div class="placeholder"><app-icon name="book" [size]="20" /> Aucun livre sélectionné</div>
            }

            @if (membre(); as m) {
              <div class="sum-member">
                <span class="avatar">{{ ini(m) }}</span>
                <div><strong>{{ m.prenom }} {{ m.nom }}</strong><span>{{ m.email }}</span></div>
              </div>
            } @else {
              <div class="placeholder"><app-icon name="user" [size]="20" /> Aucun membre sélectionné</div>
            }

            <dl class="dates">
              <div><dt>Emprunt</dt><dd>{{ aujourdhui | date: 'd MMM y' }}</dd></div>
              <div><dt>Retour prévu</dt><dd class="strong">{{ retourPrevu() | date: 'd MMM y' }}</dd></div>
            </dl>

            <div class="preview">
              <p class="label">Ce qui va se passer</p>
              <app-process-steps [preview]="true" [email]="membre()?.email ?? ''" />
            </div>

            @if (erreur()) { <p class="alert"><app-icon name="alert" [size]="18" /><span>{{ erreur() }}</span></p> }

            <button class="btn btn-gold btn-lg btn-block" type="button" [disabled]="!pret() || envoi()" (click)="valider()">
              {{ envoi() ? 'Enregistrement…' : 'Valider l’emprunt' }}
              @if (!envoi()) { <app-icon name="arrow-right" [size]="18" /> }
            </button>
          </aside>
        </div>
      }
    </div>

    @if (modalMembre()) {
      <app-modal title="Nouveau membre" (closed)="modalMembre.set(false)">
        <form (ngSubmit)="creerMembre()" novalidate>
          <div class="row-2">
            <div class="field">
              <label for="prenom">Prénom</label>
              <input id="prenom" name="prenom" class="input" [class.invalid]="essaiMembre() && !f.prenom().trim()"
                     [ngModel]="f.prenom()" (ngModelChange)="f.prenom.set($event)" />
            </div>
            <div class="field">
              <label for="nom">Nom</label>
              <input id="nom" name="nom" class="input" [class.invalid]="essaiMembre() && !f.nom().trim()"
                     [ngModel]="f.nom()" (ngModelChange)="f.nom.set($event)" />
            </div>
          </div>
          <div class="field">
            <label for="mail">Adresse e-mail</label>
            <input id="mail" name="mail" type="email" class="input" placeholder="prenom.nom@exemple.com"
                   [class.invalid]="essaiMembre() && !emailValide()"
                   [ngModel]="f.email()" (ngModelChange)="f.email.set($event)" />
            @if (essaiMembre() && !emailValide()) { <span class="field-error">Saisissez une adresse e-mail valide.</span> }
            <span class="hint">La confirmation d'emprunt sera envoyée à cette adresse.</span>
          </div>
          <div class="field">
            <label for="tel">Téléphone</label>
            <input id="tel" name="tel" class="input" placeholder="77 000 00 00"
                   [ngModel]="f.telephone()" (ngModelChange)="f.telephone.set($event)" />
          </div>
          @if (erreurMembre()) { <p class="alert"><app-icon name="alert" [size]="18" /><span>{{ erreurMembre() }}</span></p> }
          <div class="foot">
            <button class="btn btn-ghost" type="button" (click)="modalMembre.set(false)">Annuler</button>
            <button class="btn btn-primary" type="submit" [disabled]="envoiMembre()">{{ envoiMembre() ? 'Création…' : 'Créer le membre' }}</button>
          </div>
        </form>
      </app-modal>
    }
  `,
  styles: `
    .layout { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 28px; align-items: start; }
    .steps-col { display: flex; flex-direction: column; gap: 20px; }
    .block { padding: 24px; }
    .block h2 { font-size: 19px; display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
    .n { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--g-800); color: #fff; font-family: var(--font-ui); font-size: 14px; font-weight: 700; }

    .picker { list-style: none; margin: 14px 0 0; padding: 0; max-height: 330px; overflow: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px; }
    .row { width: 100%; display: flex; align-items: center; gap: 14px; padding: 10px 14px 10px 10px; text-align: left; background: #fff; border: 1.5px solid var(--line-2); border-radius: 12px; transition: border-color .15s, background .15s, box-shadow .15s; }
    .row:hover { border-color: #BCCABF; background: #FAFBF8; }
    .row.sel { border-color: var(--g-600); background: var(--g-50); box-shadow: 0 0 0 3px rgba(27,107,84,.12); }
    .mini { width: 38px; flex: none; }
    .mini.lg { width: 64px; }
    .t { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .t strong { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .t small { color: var(--ink-3); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tick { width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; border: 2px solid var(--line); color: transparent; flex: none; }
    .row.sel .tick { background: var(--g-600); border-color: var(--g-600); color: #fff; }
    .none { padding: 22px 6px 6px; color: var(--ink-3); text-align: center; }
    .sk-list { height: 200px; margin-top: 14px; }

    .member-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .member-row .select { flex: 1; min-width: 240px; }
    .seg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .seg button { display: flex; flex-direction: column; align-items: center; padding: 14px 0; background: #fff; border: 1.5px solid var(--line); border-radius: 12px; transition: all .15s; }
    .seg button:hover { border-color: #B9C7BC; }
    .seg strong { font-family: var(--font-display); font-size: 26px; line-height: 1; }
    .seg small { color: var(--ink-3); font-size: 12.5px; margin-top: 4px; }
    .seg button.on { border-color: var(--g-600); background: var(--g-50); box-shadow: 0 0 0 3px rgba(27,107,84,.12); }
    .seg button.on strong { color: var(--g-700); }

    .summary { position: sticky; top: 24px; padding: 24px; display: flex; flex-direction: column; gap: 18px; }
    .summary h2 { font-size: 19px; }
    .sum-book, .sum-member { display: flex; align-items: center; gap: 14px; }
    .sum-book strong, .sum-member strong { display: block; font-weight: 600; line-height: 1.25; }
    .sum-book span, .sum-member span:not(.avatar) { color: var(--ink-3); font-size: 13.5px; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; background: var(--g-100); color: var(--g-700); font-weight: 700; flex: none; }
    .placeholder { display: flex; align-items: center; gap: 10px; padding: 16px; border: 1.5px dashed var(--line); border-radius: 12px; color: var(--ink-3); font-size: 14px; }
    .dates { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0; padding: 14px 16px; background: var(--g-50); border-radius: 12px; }
    dt { font-size: 11.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--ink-3); }
    dd { margin: 3px 0 0; font-weight: 600; }
    dd.strong { color: var(--g-700); }
    .preview { padding-top: 18px; border-top: 1px solid var(--line-2); }
    .label { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 14px; }
    .alert { padding: 12px 14px; margin: 0; font-size: 14px; }
    .hint { font-size: 12.5px; color: var(--ink-3); }
    .foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }

    .done { max-width: 640px; margin: 28px auto 0; padding: 52px 44px 44px; text-align: center; }
    .big-check { width: 84px; height: 84px; margin: 0 auto 22px; border-radius: 50%; display: grid; place-items: center; background: var(--g-600); color: #fff; box-shadow: 0 0 0 10px var(--g-100); animation: pop .5s var(--ease) both; }
    @keyframes pop { from { transform: scale(.5); opacity: 0; } }
    .done h1 { font-size: 36px; margin-bottom: 12px; }
    .done .lede { margin: 0 auto 30px; }
    .proc { text-align: left; padding: 22px; background: var(--paper); border-radius: 14px; margin-bottom: 28px; }
    .proc-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 18px; font-weight: 600; font-size: 14.5px; }
    .proc-head span { display: inline-flex; align-items: center; gap: 8px; color: var(--g-700); }
    .proc-head code { font-size: 12.5px; padding: 3px 9px; background: #fff; border: 1px solid var(--line); border-radius: 7px; font-family: ui-monospace, Consolas, monospace; color: var(--ink-2); }
    .center { justify-content: center; }

    @media (max-width: 1000px) {
      .layout { grid-template-columns: 1fr; }
      .summary { position: static; }
    }
    @media (max-width: 560px) { .done { padding: 36px 22px; } .seg { grid-template-columns: repeat(2, 1fr); } }
  `,
})
export class NouvelEmprunt {
  private api = inject(Api);
  private toast = inject(Toast);

  /** Livre présélectionné via ?livre=numero */
  livre_ = input<string | undefined>(undefined, { alias: 'livre' });

  protected durees = [7, 14, 21, 30];
  protected aujourdhui = new Date();

  protected livres = signal<Livre[]>([]);
  protected membres = signal<Membre[]>([]);
  protected chargement = signal(true);
  protected erreurChargement = signal('');

  protected recherche = signal('');
  protected livreId = signal<number | null>(null);
  protected membreId = signal<number | null>(null);
  protected duree = signal(14);
  protected envoi = signal(false);
  protected erreur = signal('');
  protected cree = signal<EmpruntModel | null>(null);

  protected modalMembre = signal(false);
  protected essaiMembre = signal(false);
  protected envoiMembre = signal(false);
  protected erreurMembre = signal('');
  protected f = {
    prenom: signal(''), nom: signal(''), email: signal(''), telephone: signal(''),
  };

  protected disponibles = computed(() => {
    const q = this.recherche().trim().toLowerCase();
    return this.livres().filter(
      (l) => l.disponible && (!q || `${l.titre} ${l.auteur} ${l.categorie}`.toLowerCase().includes(q)),
    );
  });
  protected livre = computed(() => this.livres().find((l) => l.numero === this.livreId()) ?? null);
  protected membre = computed(() => this.membres().find((m) => m.id === this.membreId()) ?? null);
  protected pret = computed(() => this.livre() !== null && this.membre() !== null);
  protected retourPrevu = computed(() => new Date(Date.now() + this.duree() * 86_400_000));
  protected emailValide = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.f.email().trim()));
  protected ini = (m: Membre) => initiales(m.nom, m.prenom);

  constructor() {
    this.charger();
  }

  private charger() {
    this.chargement.set(true);
    this.api.livres().subscribe({
      next: (l) => {
        this.livres.set(l);
        this.chargement.set(false);
        const pre = Number(this.livre_());
        if (pre && l.some((x) => x.numero === pre && x.disponible)) this.livreId.set(pre);
      },
      error: (e) => { this.erreurChargement.set(messageErreur(e)); this.chargement.set(false); },
    });
    this.api.membres().subscribe({ next: (m) => this.membres.set(m), error: () => {} });
  }

  ouvrirMembre() {
    this.f.prenom.set(''); this.f.nom.set(''); this.f.email.set(''); this.f.telephone.set('');
    this.essaiMembre.set(false);
    this.erreurMembre.set('');
    this.modalMembre.set(true);
  }

  creerMembre() {
    this.essaiMembre.set(true);
    if (!this.f.prenom().trim() || !this.f.nom().trim() || !this.emailValide()) return;
    this.envoiMembre.set(true);
    this.erreurMembre.set('');
    this.api
      .creerMembre({
        prenom: this.f.prenom().trim(),
        nom: this.f.nom().trim(),
        email: this.f.email().trim(),
        telephone: this.f.telephone().trim(),
      })
      .subscribe({
        next: (m) => {
          this.envoiMembre.set(false);
          this.membres.update((l) => [...l, m]);
          this.membreId.set(m.id!);
          this.modalMembre.set(false);
          this.toast.show(`${m.prenom} ${m.nom} a été ajouté(e) aux membres.`);
        },
        error: (e) => { this.envoiMembre.set(false); this.erreurMembre.set(messageErreur(e)); },
      });
  }

  valider() {
    if (!this.pret()) return;
    this.envoi.set(true);
    this.erreur.set('');
    this.api
      .creerEmprunt({ livreId: this.livreId()!, membreId: this.membreId()!, dureeJours: this.duree() })
      .subscribe({
        next: (e) => {
          this.envoi.set(false);
          this.cree.set(e);
          // La tâche « Retour » apparaît dans Camunda une fois le mail envoyé.
          this.api.aTraiter().subscribe({ error: () => {} });
          setTimeout(() => this.api.aTraiter().subscribe({ error: () => {} }), 3000);
        },
        error: (e) => { this.envoi.set(false); this.erreur.set(messageErreur(e)); },
      });
  }

  recommencer() {
    this.cree.set(null);
    this.livreId.set(null);
    this.membreId.set(null);
    this.duree.set(14);
    this.recherche.set('');
    this.charger();
  }
}
