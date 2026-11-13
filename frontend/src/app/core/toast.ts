import { Injectable, signal } from '@angular/core';

export interface ToastItem {
  id: number;
  message: string;
  type: 'ok' | 'error';
}

@Injectable({ providedIn: 'root' })
export class Toast {
  readonly items = signal<ToastItem[]>([]);
  private next = 1;

  show(message: string, type: 'ok' | 'error' = 'ok') {
    const id = this.next++;
    this.items.update((l) => [...l, { id, message, type }]);
    setTimeout(() => this.dismiss(id), type === 'error' ? 6000 : 3800);
  }
  dismiss(id: number) {
    this.items.update((l) => l.filter((t) => t.id !== id));
  }
}
