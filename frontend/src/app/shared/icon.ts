import { Component, computed, input } from '@angular/core';

const PATHS: Record<string, string> = {
  book: 'M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z',
  library: 'M5 4v16 M10 4v16 M15.5 5l4 14.5 M3 20h18',
  plus: 'M12 5v14 M5 12h14',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  check: 'M20 6 9 17l-5-5',
  'check-circle': 'M22 11.1V12a10 10 0 1 1-5.9-9.1 M22 4 12 14l-3-3',
  'log-out': 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M21 21l-4.3-4.3',
  'arrow-left': 'M19 12H5 M12 19l-7-7 7-7',
  'arrow-right': 'M5 12h14 M12 5l7 7-7 7',
  mail: 'M3 5h18v14H3z M3 7l9 6 9-6',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  alert: 'M12 9v4 M12 17h.01 M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  x: 'M18 6 6 18 M6 6l12 12',
  trash: 'M3 6h18 M8 6V4h8v2 M6 6l1 14h10l1-14 M10 11v5 M14 11v5',
  edit: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  refresh: 'M21 12a9 9 0 1 1-3-6.7 M21 3v6h-6',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  calendar: 'M3 5h18v16H3z M3 10h18 M8 3v4 M16 3v4',
  hash: 'M4 9h16 M4 15h16 M10 3 8 21 M16 3l-2 18',
  flow: 'M4 3h6v6H4z M14 15h6v6h-6z M7 9v3a3 3 0 0 0 3 3h4',
  lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
  undo: 'M9 14 4 9l5-5 M4 9h10a6 6 0 0 1 0 12h-3',
};

@Component({
  selector: 'app-icon',
  template: `<svg
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    [attr.stroke-width]="stroke()"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path [attr.d]="d()" />
  </svg>`,
  styles: `:host { display: inline-flex; line-height: 0; } svg { display: block; }`,
})
export class Icon {
  name = input.required<string>();
  size = input(20);
  stroke = input(1.8);
  protected d = computed(() => PATHS[this.name()] ?? '');
}
