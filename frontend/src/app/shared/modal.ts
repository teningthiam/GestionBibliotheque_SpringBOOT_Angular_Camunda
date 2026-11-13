import { Component, input, output } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'app-modal',
  imports: [Icon],
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="overlay" (click)="closed.emit()">
      <div class="dialog" role="dialog" aria-modal="true" [attr.aria-label]="title()" (click)="$event.stopPropagation()">
        <header>
          <h2>{{ title() }}</h2>
          <button class="btn-icon" type="button" (click)="closed.emit()" aria-label="Fermer">
            <app-icon name="x" />
          </button>
        </header>
        <div class="body"><ng-content /></div>
      </div>
    </div>
  `,
  styles: `
    .overlay {
      position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 20px;
      background: rgba(7, 30, 23, .55); backdrop-filter: blur(3px); animation: fade .18s ease both;
    }
    .dialog {
      width: min(520px, 100%); max-height: 92vh; overflow: auto; background: #fff; border-radius: 18px;
      box-shadow: var(--shadow-lg); animation: pop .26s var(--ease) both;
    }
    header { display: flex; align-items: center; justify-content: space-between; padding: 20px 22px 0 26px; }
    h2 { font-size: 22px; }
    .body { padding: 18px 26px 26px; }
    @keyframes fade { from { opacity: 0; } }
    @keyframes pop { from { opacity: 0; transform: translateY(14px) scale(.98); } }
  `,
})
export class Modal {
  title = input.required<string>();
  closed = output<void>();
}
