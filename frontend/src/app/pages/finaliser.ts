import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../core/api';
import { TacheRetour } from '../core/models';
import { Toast } from '../core/toast';
import { enRetard, messageErreur } from '../core/utils';
import { BookCover } from '../shared/book-cover';
import { Icon } from '../shared/icon';
import { Modal } from '../shared/modal';
import { ProcessSteps } from '../shared/process-steps';

@Component({
  selector: 'app-finaliser',
  imports: [DatePipe, RouterLink, Icon, BookCover, Modal, ProcessSteps],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Retours</p>
          <h1>Finaliser un emprunt</h1>
          <p class="lede">
            Ces livres attendent leur retour. La liste provient des tâches « Retour » en attente dans Camunda.
          </p>
        </div>
        <button class="btn btn-ghost" type="button" (click)="charger()"><app-icon name="refresh" [size]="17" /> Actualiser</button>
      </header>

      @if (loading()) {
        <div class="list">@for (n of [1,2,3]; track n) { <div class="skeleton sk-card"></div> }</div>
      } @else if (erreur()) {
        <div class="alert"><app-icon name="alert" /><div><strong>Chargement impossible</strong>{{ erreur() }}</div></div>
      } @else if (taches().length === 0) {
        <div class="card empty">
          <div class="ico"><app-icon name="check-circle" [size]="30" /></div>
          <h3>Aucun retour en attente</h3>
          <p>Tous les livres empruntés ont été rendus. Les nouveaux emprunts apparaîtront ici dès que le processus atteindra l'étape « Retour ».</p>
          <a class="btn btn-primary" routerLink="/emprunt">Nouvel emprunt</a>
        </div>
      } @else {
        <div class="list">
          @for (t of taches(); track t.userTaskKey; let i = $index) {
            <article class="card task" [style.--i]="i">
              <div class="task-main">
                @if (t.emprunt; as e) {
                  <div class="book">
                    <div class="mini"><app-book-cover [titre]="e.livre.titre" [auteur]="e.livre.auteur" /></div>
                    <div class="who">
                      <div class="flags">
                        <span class="badge busy">À l'étape « {{ t.tache }} »</span>
                        @if (retard(t)) { <span class="badge late">En retard</span> }
                      </div>
                      <h2>{{ e.livre.titre }}</h2>
                      <p class="muted">{{ e.livre.auteur }}</p>
                      <dl>
                        <div><dt>Emprunté par</dt><dd>{{ e.membre.prenom }} {{ e.membre.nom }}</dd></div>
                        <div><dt>Le</dt><dd>{{ e.dateEmprunt | date: 'd MMM y' }}</dd></div>
                        <div><dt>Retour prévu</dt><dd [class.late]="retard(t)">{{ e.dateRetourPrevue | date: 'd MMM y' }}</dd></div>
                      </dl>
                    </div>
                  </div>
                } @else {
                  <div class="who"><span class="badge busy">À l'étape « {{ t.tache }} »</span><h2>Emprunt non retrouvé</h2>
                    <p class="muted">Ce processus n'est associé à aucun emprunt en base de données.</p></div>
                }
              </div>

              <div class="task-steps"><app-process-steps [stage]="2" [email]="t.emprunt?.membre?.email ?? ''" /></div>

              <footer>
                <span class="key"><app-icon name="flow" [size]="15" /> Instance <code>{{ t.processInstanceKey }}</code>
                  <span class="muted">· créée le {{ t.creeLe | date: 'd MMM y, HH:mm' }}</span></span>
                <button class="btn btn-primary" type="button" (click)="confirmation.set(t)">
                  <app-icon name="check-circle" [size]="18" /> Enregistrer le retour
                </button>
              </footer>
            </article>
          }
        </div>
      }
    </div>

    @if (confirmation(); as t) {
      <app-modal title="Confirmer le retour" (closed)="fermer()">
        <p class="confirm">
          @if (t.emprunt; as e) {
            Le livre <strong>« {{ e.livre.titre }} »</strong> a-t-il été rendu par
            <strong>{{ e.membre.prenom }} {{ e.membre.nom }}</strong> ?
          } @else { Confirmer le retour pour l'instance {{ t.processInstanceKey }} ? }
        </p>
        <ul class="effects">
          <li><app-icon name="check" [size]="16" [stroke]="2.4" /> La tâche « Retour » est terminée dans Camunda</li>
          <li><app-icon name="check" [size]="16" [stroke]="2.4" /> Le processus se termine</li>
          <li><app-icon name="check" [size]="16" [stroke]="2.4" /> Le livre redevient disponible</li>
        </ul>
        @if (erreurRetour()) { <p class="alert"><app-icon name="alert" [size]="18" /><span>{{ erreurRetour() }}</span></p> }
        <div class="foot">
          <button class="btn btn-ghost" type="button" (click)="fermer()">Annuler</button>
          <button class="btn btn-primary" type="button" [disabled]="envoi()" (click)="valider(t)">
            {{ envoi() ? 'Enregistrement…' : 'Confirmer le retour' }}
          </button>
        </div>
      </app-modal>
    }
  `,
  styles: `
    .list { display: flex; flex-direction: column; gap: 20px; }
    .sk-card { height: 220px; border-radius: var(--radius); }
    .task { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 0; overflow: hidden; animation: rise .5s var(--ease) both; animation-delay: calc(var(--i) * 70ms); }
    .task-main { padding: 26px 28px; }
    .task-steps { padding: 26px 28px; background: #FAFBF8; border-left: 1px solid var(--line-2); }
    .book { display: flex; gap: 22px; }
    .mini { width: 84px; flex: none; }
    .who { min-width: 0; }
    .flags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    h2 { font-size: 23px; }
    .who > p { margin: 3px 0 16px; }
    dl { display: flex; flex-wrap: wrap; gap: 8px 32px; margin: 0; }
    dt { font-size: 11.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--ink-3); }
    dd { margin: 2px 0 0; font-weight: 600; }
    dd.late { color: var(--red); }
    footer { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 16px 28px; border-top: 1px solid var(--line-2); }
    .key { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--ink-2); flex-wrap: wrap; }
    code { font-family: ui-monospace, Consolas, monospace; font-size: 12.5px; padding: 3px 8px; background: var(--paper); border-radius: 6px; }
    .confirm { color: var(--ink-2); margin-bottom: 16px; line-height: 1.55; }
    .confirm strong { color: var(--ink); }
    .effects { list-style: none; margin: 0 0 22px; padding: 16px 18px; background: var(--g-50); border-radius: 12px; display: flex; flex-direction: column; gap: 10px; font-size: 14.5px; }
    .effects li { display: flex; gap: 10px; align-items: center; }
    .effects app-icon { color: var(--g-600); }
    .foot { display: flex; justify-content: flex-end; gap: 10px; }
    .alert { margin: 0 0 16px; padding: 12px 14px; }
    @media (max-width: 860px) {
      .task { grid-template-columns: 1fr; }
      .task-steps { border-left: 0; border-top: 1px solid var(--line-2); }
      .book { flex-direction: column; gap: 16px; }
    }
  `,
})
export class Finaliser {
  private api = inject(Api);
  private toast = inject(Toast);

  protected taches = signal<TacheRetour[]>([]);
  protected loading = signal(true);
  protected erreur = signal('');
  protected confirmation = signal<TacheRetour | null>(null);
  protected envoi = signal(false);
  protected erreurRetour = signal('');

  constructor() {
    this.charger();
  }

  protected retard = (t: TacheRetour) => (t.emprunt ? enRetard(t.emprunt) : false);

  charger() {
    this.loading.set(true);
    this.erreur.set('');
    this.api.aTraiter().subscribe({
      next: (l) => { this.taches.set(l); this.loading.set(false); },
      error: (e) => { this.erreur.set(messageErreur(e)); this.loading.set(false); },
    });
  }

  fermer() {
    this.confirmation.set(null);
    this.erreurRetour.set('');
  }

  valider(t: TacheRetour) {
    this.envoi.set(true);
    this.erreurRetour.set('');
    this.api.retour(t.userTaskKey, t.processInstanceKey).subscribe({
      next: () => {
        this.envoi.set(false);
        this.confirmation.set(null);
        this.taches.update((l) => l.filter((x) => x.userTaskKey !== t.userTaskKey));
        this.api.pending.set(this.taches().length);
        const titre = t.emprunt?.livre.titre;
        this.toast.show(titre ? `« ${titre} » est de retour en bibliothèque.` : 'Retour enregistré.');
      },
      error: (e) => { this.envoi.set(false); this.erreurRetour.set(messageErreur(e)); },
    });
  }
}
