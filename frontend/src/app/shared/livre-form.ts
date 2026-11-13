import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../core/api';
import { Livre } from '../core/models';
import { messageErreur } from '../core/utils';
import { Icon } from './icon';

/** Formulaire d'ajout / modification d'un livre (utilisé dans une fenêtre modale). */
@Component({
  selector: 'app-livre-form',
  imports: [FormsModule, Icon],
  template: `
    <form (ngSubmit)="enregistrer()" novalidate>
      <div class="field">
        <label for="titre">Titre</label>
        <input id="titre" name="titre" class="input" placeholder="Ex. Une si longue lettre"
               [class.invalid]="essaye() && !titre().trim()"
               [ngModel]="titre()" (ngModelChange)="titre.set($event)" />
        @if (essaye() && !titre().trim()) { <span class="field-error">Le titre est obligatoire.</span> }
      </div>
      <div class="field">
        <label for="auteur">Auteur</label>
        <input id="auteur" name="auteur" class="input" placeholder="Ex. Mariama Bâ"
               [class.invalid]="essaye() && !auteur().trim()"
               [ngModel]="auteur()" (ngModelChange)="auteur.set($event)" />
        @if (essaye() && !auteur().trim()) { <span class="field-error">L'auteur est obligatoire.</span> }
      </div>
      <div class="field">
        <label for="categorie">Catégorie</label>
        <input id="categorie" name="categorie" class="input" list="cats" placeholder="Ex. Roman"
               [class.invalid]="essaye() && !categorie().trim()"
               [ngModel]="categorie()" (ngModelChange)="categorie.set($event)" />
        <datalist id="cats">@for (c of categories(); track c) { <option [value]="c"></option> }</datalist>
        @if (essaye() && !categorie().trim()) { <span class="field-error">La catégorie est obligatoire.</span> }
      </div>

      @if (erreur()) {
        <p class="alert"><app-icon name="alert" [size]="18" /><span>{{ erreur() }}</span></p>
      }

      <div class="foot">
        <button type="button" class="btn btn-ghost" (click)="cancel.emit()">Annuler</button>
        <button type="submit" class="btn btn-primary" [disabled]="envoi()">
          {{ envoi() ? 'Enregistrement…' : livre() ? 'Enregistrer' : 'Ajouter le livre' }}
        </button>
      </div>
    </form>
  `,
  styles: `
    .foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .alert { margin: 0 0 14px; padding: 12px 14px; }
  `,
})
export class LivreForm implements OnInit {
  private api = inject(Api);

  livre = input<Livre | null>(null);
  categories = input<string[]>([]);
  saved = output<Livre>();
  cancel = output<void>();

  protected titre = signal('');
  protected auteur = signal('');
  protected categorie = signal('');
  protected essaye = signal(false);
  protected envoi = signal(false);
  protected erreur = signal('');

  ngOnInit() {
    const l = this.livre();
    if (l) {
      this.titre.set(l.titre);
      this.auteur.set(l.auteur);
      this.categorie.set(l.categorie);
    }
  }

  enregistrer() {
    this.essaye.set(true);
    if (!this.titre().trim() || !this.auteur().trim() || !this.categorie().trim()) return;

    const corps: Livre = {
      titre: this.titre().trim(),
      auteur: this.auteur().trim(),
      categorie: this.categorie().trim(),
    };
    const existant = this.livre();
    this.envoi.set(true);
    this.erreur.set('');
    const req = existant?.numero != null
      ? this.api.modifierLivre(existant.numero, corps)
      : this.api.creerLivre(corps);
    req.subscribe({
      next: (l) => { this.envoi.set(false); this.saved.emit(l); },
      error: (e) => { this.envoi.set(false); this.erreur.set(messageErreur(e)); },
    });
  }
}
