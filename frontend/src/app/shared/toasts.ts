import { Component, inject } from '@angular/core';
import { Toast } from '../core/toast';
import { Icon } from './icon';

@Component({
  selector: 'app-toasts',
  imports: [Icon],
  template: `
    <div class="stack" aria-live="polite">
      @for (t of toast.items(); track t.id) {
        <div class="toast" [class.err]="t.type === 'error'" role="status">
          <app-icon [name]="t.type === 'error' ? 'alert' : 'check-circle'" [size]="20" />
          <span>{{ t.message }}</span>
          <button type="button" (click)="toast.dismiss(t.id)" aria-label="Fermer"><app-icon name="x" [size]="16" /></button>
        </div>
      }
    </div>
  `,
  styles: `
    .stack { position: fixed; right: 22px; bottom: 22px; z-index: 80; display: flex; flex-direction: column; gap: 10px; }
    .toast {
      display: flex; align-items: center; gap: 12px; min-width: 260px; max-width: 420px; padding: 14px 14px 14px 16px;
      background: var(--g-900); color: #fff; border-radius: 13px; box-shadow: var(--shadow-lg);
      border-left: 4px solid var(--gold); animation: slide .3s var(--ease) both;
    }
    .toast.err { background: #5A1F14; border-left-color: #F08A72; }
    .toast span { flex: 1; font-size: 14.5px; font-weight: 500; }
    .toast button { background: none; border: 0; color: inherit; opacity: .6; display: grid; padding: 4px; }
    .toast button:hover { opacity: 1; }
    @keyframes slide { from { opacity: 0; transform: translateX(24px); } }
  `,
})
export class Toasts {
  protected toast = inject(Toast);
}
