import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Api } from '../core/api';
import { Auth } from '../core/auth';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  template: `
    <div class="shell" [class.open]="menu()">
      <aside class="side">
        <a class="brand" routerLink="/livres" (click)="menu.set(false)">
          <span class="mark"><app-icon name="library" [size]="22" [stroke]="2.2" /></span>
          <span class="brand-text"><strong>Bibliothèque</strong><small>Gestion des prêts</small></span>
        </a>

        <p class="group">Navigation</p>
        <nav (click)="menu.set(false)">
          <a routerLink="/livres" routerLinkActive="active"><app-icon name="book" /> Catalogue</a>
          <a routerLink="/emprunt" routerLinkActive="active"><app-icon name="plus" /> Nouvel emprunt</a>
          <a routerLink="/emprunts" routerLinkActive="active"><app-icon name="list" /> Emprunts</a>
          <a routerLink="/finaliser" routerLinkActive="active">
            <app-icon name="undo" /> Finaliser un retour
            @if (api.pending() > 0) { <span class="count">{{ api.pending() }}</span> }
          </a>
        </nav>

        <div class="spines" aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
        </div>

        <div class="user">
          <span class="avatar">{{ auth.user()?.prenom?.[0] ?? '?' }}</span>
          <span class="who"><strong>{{ auth.user()?.prenom }} {{ auth.user()?.nom }}</strong><small>{{ auth.user()?.email }}</small></span>
          <button type="button" class="out" (click)="logout()" aria-label="Se déconnecter" title="Se déconnecter">
            <app-icon name="log-out" [size]="18" />
          </button>
        </div>
      </aside>

      <div class="backdrop" (click)="menu.set(false)"></div>

      <div class="main">
        <header class="topbar">
          <button type="button" class="burger" (click)="menu.set(true)" aria-label="Ouvrir le menu"><app-icon name="menu" /></button>
          <strong>Bibliothèque</strong>
        </header>
        <router-outlet />
      </div>
    </div>
  `,
  styles: `
    .shell { display: grid; grid-template-columns: 272px 1fr; min-height: 100vh; }
    .side {
      position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; padding: 26px 18px 18px;
      background: var(--g-900); color: #D5E4DC; overflow: hidden;
    }
    .side::before {
      content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .5;
      background: radial-gradient(120% 60% at 0% 0%, rgba(27,107,84,.45), transparent 60%);
    }
    .side > * { position: relative; }
    .brand { display: flex; align-items: center; gap: 13px; padding: 0 8px 26px; }
    .mark { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; background: var(--gold); color: var(--g-950); }
    .brand-text { display: flex; flex-direction: column; }
    .brand-text strong { font-family: var(--font-display); font-size: 19px; color: #fff; font-weight: 600; }
    .brand-text small { font-size: 12px; opacity: .6; letter-spacing: .04em; }
    .group { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; opacity: .45; padding: 0 12px 10px; }
    nav { display: flex; flex-direction: column; gap: 4px; }
    nav a {
      display: flex; align-items: center; gap: 13px; height: 46px; padding: 0 14px; border-radius: 12px;
      font-weight: 500; color: #C2D6CB; position: relative; transition: background .15s, color .15s;
    }
    nav a:hover { background: rgba(255,255,255,.06); color: #fff; }
    nav a.active { background: rgba(255,255,255,.1); color: #fff; font-weight: 600; }
    nav a.active::before { content: ''; position: absolute; left: -18px; top: 11px; bottom: 11px; width: 4px; border-radius: 0 4px 4px 0; background: var(--gold); }
    .count { margin-left: auto; min-width: 24px; height: 24px; padding: 0 7px; border-radius: 99px; display: grid; place-items: center; background: var(--gold); color: var(--g-950); font-size: 12.5px; font-weight: 700; }

    .spines { margin-top: auto; display: flex; align-items: flex-end; gap: 5px; height: 84px; padding: 0 10px 18px; opacity: .9; }
    .spines i { flex: 1; border-radius: 3px 3px 0 0; background: #145240; }
    .spines i:nth-child(1) { height: 62%; } .spines i:nth-child(2) { height: 86%; background: #D9A23A; }
    .spines i:nth-child(3) { height: 70%; background: #1B6B54; } .spines i:nth-child(4) { height: 100%; background: #F6EFD9; opacity: .85; }
    .spines i:nth-child(5) { height: 74%; background: #7A2E2E; } .spines i:nth-child(6) { height: 92%; }
    .spines i:nth-child(7) { height: 66%; background: #B5821F; } .spines i:nth-child(8) { height: 80%; background: #1F3A5F; }
    .spines i:nth-child(9) { height: 58%; background: #1B6B54; }

    .user { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px; background: rgba(255,255,255,.06); }
    .avatar { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; background: var(--g-600); color: #fff; font-weight: 700; flex: none; }
    .who { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .who strong { font-size: 14px; color: #fff; font-weight: 600; }
    .who small { font-size: 12px; opacity: .6; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .out { background: none; border: 0; color: #C2D6CB; width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; }
    .out:hover { background: rgba(255,255,255,.1); color: #fff; }

    .main { min-width: 0; }
    .topbar, .backdrop { display: none; }

    @media (max-width: 900px) {
      .shell { grid-template-columns: 1fr; }
      .side { position: fixed; z-index: 40; left: 0; top: 0; width: 288px; transform: translateX(-100%); transition: transform .28s var(--ease); }
      .shell.open .side { transform: none; box-shadow: var(--shadow-lg); }
      .backdrop { display: block; position: fixed; inset: 0; z-index: 30; background: rgba(7,30,23,.5); opacity: 0; pointer-events: none; transition: opacity .2s; }
      .shell.open .backdrop { opacity: 1; pointer-events: auto; }
      .topbar { display: flex; align-items: center; gap: 12px; height: 58px; padding: 0 14px; background: var(--g-900); color: #fff; position: sticky; top: 0; z-index: 20; }
      .topbar strong { font-family: var(--font-display); font-size: 18px; font-weight: 600; }
      .burger { background: none; border: 0; color: #fff; width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; }
    }
  `,
})
export class Shell {
  protected api = inject(Api);
  protected auth = inject(Auth);
  private router = inject(Router);
  protected menu = signal(false);

  constructor() {
    this.api.aTraiter().subscribe({ error: () => {} });
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
