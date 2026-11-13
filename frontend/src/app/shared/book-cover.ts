import { Component, computed, input } from '@angular/core';

/** Toiles de reliure : fond, filet doré, texte. */
const CLOTHS: { bg: string; ink: string; rule: string }[] = [
  { bg: '#0E3B2E', ink: '#F6EFD9', rule: '#D9A23A' },
  { bg: '#7A2E2E', ink: '#F7E8DA', rule: '#E8B76B' },
  { bg: '#1F3A5F', ink: '#E9EEF6', rule: '#D9A23A' },
  { bg: '#5B3A29', ink: '#F6EBDD', rule: '#D9A23A' },
  { bg: '#4A2C5A', ink: '#F1E8F5', rule: '#E5C16A' },
  { bg: '#B5821F', ink: '#1E1707', rule: '#1E1707' },
  { bg: '#2F5D62', ink: '#E6F1F1', rule: '#E5C16A' },
  { bg: '#26302B', ink: '#EEF1EC', rule: '#D9A23A' },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

@Component({
  selector: 'app-book-cover',
  template: `
    <div class="cover" [style.--bg]="c().bg" [style.--ink]="c().ink" [style.--rule]="c().rule">
      <span class="rule"></span>
      <span class="title">{{ titre() }}</span>
      <span class="auteur">{{ auteur() }}</span>
    </div>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .cover {
      position: relative; aspect-ratio: 2 / 3; width: 100%;
      background:
        linear-gradient(90deg, rgba(0,0,0,.28) 0, rgba(0,0,0,.06) 5%, rgba(255,255,255,.07) 7%, transparent 14%),
        linear-gradient(180deg, rgba(255,255,255,.06), rgba(0,0,0,.14)),
        var(--bg);
      color: var(--ink);
      border-radius: 3px 8px 8px 3px;
      padding: 13cqw 11cqw 11cqw 16cqw;
      display: flex; flex-direction: column; gap: 6cqw;
      box-shadow: 0 1px 0 rgba(255,255,255,.12) inset, 0 14px 22px -12px rgba(10,42,33,.55), 0 2px 4px rgba(10,42,33,.2);
      overflow: hidden;
    }
    .rule { display: block; width: 22cqw; height: 1.4cqw; background: var(--rule); border-radius: 2px; flex: none; }
    .title {
      font-family: var(--font-display); font-weight: 600; line-height: 1.12;
      font-size: 11.5cqw; letter-spacing: -.01em; overflow: hidden;
      display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical;
    }
    .auteur {
      margin-top: auto; font-size: 6.4cqw; letter-spacing: .09em; text-transform: uppercase;
      font-weight: 600; opacity: .8; overflow: hidden; display: -webkit-box;
      -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    }
  `,
})
export class BookCover {
  titre = input.required<string>();
  auteur = input('');
  protected c = computed(() => CLOTHS[hash(this.titre()) % CLOTHS.length]);
}
