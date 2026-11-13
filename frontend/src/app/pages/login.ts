import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../core/auth';
import { AuthLayout } from '../shared/auth-layout';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-login',
  imports: [FormsModule, Icon, AuthLayout],
  template: `
    <app-auth-layout>
      <form class="auth-form" (ngSubmit)="submit()" novalidate autocomplete="off">
        <h2>Connexion</h2>
        <p class="sub">Accédez à l'espace de gestion de la bibliothèque.</p>

        <div class="field">
          <label for="email">Adresse e-mail</label>
          <div class="input-icon">
            <app-icon name="mail" [size]="18" />
            <input id="email" class="input" type="email" name="email" autocomplete="off"
                   placeholder="vous@exemple.com" [class.invalid]="essaye() && !email().trim()"
                   [ngModel]="email()" (ngModelChange)="email.set($event); erreur.set('')" />
          </div>
        </div>

        <div class="field">
          <label for="password">Mot de passe</label>
          <div class="input-icon">
            <app-icon name="lock" [size]="18" />
            <input id="password" class="input" type="password" name="password" autocomplete="new-password"
                   placeholder="••••••••" [class.invalid]="essaye() && !password()"
                   [ngModel]="password()" (ngModelChange)="password.set($event); erreur.set('')" />
          </div>
        </div>

        @if (erreur()) {
          <p class="field-error err"><app-icon name="alert" [size]="16" /> {{ erreur() }}</p>
        }

        <button class="btn btn-primary btn-lg btn-block" type="submit">
          Se connecter <app-icon name="arrow-right" [size]="18" />
        </button>
      </form>
    </app-auth-layout>
  `,
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  protected email = signal('');
  protected password = signal('');
  protected erreur = signal('');
  protected essaye = signal(false);

  submit() {
    this.essaye.set(true);
    if (!this.email().trim() || !this.password()) {
      this.erreur.set('Saisissez votre adresse e-mail et votre mot de passe.');
      return;
    }
    if (this.auth.login(this.email(), this.password())) {
      this.router.navigateByUrl('/livres');
    } else {
      this.erreur.set('Adresse e-mail ou mot de passe incorrect.');
    }
  }
}
