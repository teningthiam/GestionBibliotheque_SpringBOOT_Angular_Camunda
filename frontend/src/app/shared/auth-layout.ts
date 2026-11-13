import { Component } from '@angular/core';
import { Icon } from './icon';

/** Cadre de la page de connexion (panneau visuel + formulaire projeté). */
@Component({
  selector: 'app-auth-layout',
  imports: [Icon],
  template: `
    <div class="auth">
      <section class="hero">
        <div class="brand">
          <span class="mark"><app-icon name="library" [size]="22" [stroke]="2.2" /></span>
          <strong>Bibliothèque</strong>
        </div>

        <div class="pitch">
          <p class="eyebrow">Gestion des prêts</p>
          <h1>Chaque livre prêté,<br /><em>chaque retour suivi.</em></h1>
          <p class="lede">
            Catalogue, emprunts et retours reliés à un processus Camunda : de la demande jusqu'à
            l'e-mail de confirmation.
          </p>
        </div>

        <div class="shelf" aria-hidden="true">
          @for (s of spines; track $index) {
            <i [style.height.%]="s.h" [style.background]="s.c" [style.--i]="$index"></i>
          }
        </div>
      </section>

      <section class="panel"><ng-content /></section>
    </div>
  `,
  styles: `
    .auth { min-height: 100vh; display: grid; grid-template-columns: 1.1fr 1fr; }
    .hero {
      position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
      padding: 44px 56px 0; background: var(--g-900); color: #fff;
    }
    .hero::before {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(90% 70% at 0% 0%, rgba(27,107,84,.55), transparent 62%),
                  radial-gradient(60% 50% at 100% 100%, rgba(217,162,58,.16), transparent 60%);
    }
    .hero > * { position: relative; }
    .brand { display: flex; align-items: center; gap: 13px; }
    .brand strong { font-family: var(--font-display); font-size: 21px; font-weight: 600; }
    .mark { width: 44px; height: 44px; border-radius: 13px; display: grid; place-items: center; background: var(--gold); color: var(--g-950); }
    .pitch { max-width: 560px; padding: 40px 0; }
    .pitch .eyebrow { color: var(--gold); }
    h1 { font-size: clamp(36px, 4.4vw, 58px); line-height: 1.08; color: #fff; }
    h1 em { font-style: italic; color: var(--gold); font-weight: 500; }
    .lede { margin-top: 22px; font-size: 17px; line-height: 1.6; color: #B9D0C4; max-width: 46ch; }
    .shelf { display: flex; align-items: flex-end; gap: 7px; height: 150px; padding: 0 2px; }
    .shelf i {
      flex: 1; border-radius: 4px 4px 0 0; transform-origin: bottom; animation: grow .7s var(--ease) both;
      animation-delay: calc(var(--i) * 55ms + 150ms);
      box-shadow: inset 2px 0 0 rgba(255,255,255,.14), inset -2px 0 0 rgba(0,0,0,.18);
    }
    @keyframes grow { from { transform: scaleY(.2); opacity: 0; } }
    .panel { display: grid; place-items: center; padding: 40px 28px; background: var(--paper); }
    @media (max-width: 860px) {
      .auth { grid-template-columns: 1fr; }
      .hero { padding: 28px 24px 0; }
      .pitch { padding: 28px 0 24px; }
      .shelf { height: 80px; }
      .lede { font-size: 15px; }
    }
  `,
})
export class AuthLayout {
  protected spines = [
    { h: 52, c: '#145240' }, { h: 78, c: '#D9A23A' }, { h: 64, c: '#1B6B54' }, { h: 100, c: '#F6EFD9' },
    { h: 70, c: '#7A2E2E' }, { h: 88, c: '#2F5D62' }, { h: 58, c: '#B5821F' }, { h: 94, c: '#1F3A5F' },
    { h: 66, c: '#145240' }, { h: 82, c: '#4A2C5A' }, { h: 60, c: '#D9A23A' }, { h: 90, c: '#1B6B54' },
    { h: 72, c: '#F6EFD9' }, { h: 56, c: '#5B3A29' }, { h: 84, c: '#145240' }, { h: 68, c: '#B5821F' },
  ];
}
