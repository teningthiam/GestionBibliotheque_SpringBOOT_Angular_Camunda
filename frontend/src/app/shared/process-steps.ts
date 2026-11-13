import { Component, computed, input } from '@angular/core';
import { Icon } from './icon';

/**
 * Représente l'avancement du processus Camunda « Emprunt » :
 * Emprunt enregistré → Confirmation par e-mail → Retour du livre.
 * `stage` = nombre d'étapes terminées (la suivante est « en attente »).
 */
@Component({
  selector: 'app-process-steps',
  imports: [Icon],
  template: `
    <ol class="steps" [class.preview]="preview()">
      @for (s of steps(); track s.label; let i = $index) {
        <li [class.done]="!preview() && i < stage()" [class.active]="!preview() && i === stage()">
          <span class="dot">
            @if (!preview() && i < stage()) { <app-icon name="check" [size]="14" [stroke]="2.6" /> }
            @else { {{ i + 1 }} }
          </span>
          <span class="txt">
            <strong>{{ s.label }}</strong>
            <small>{{ s.hint }}</small>
          </span>
        </li>
      }
    </ol>
  `,
  styles: `
    .steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
    li { display: flex; gap: 14px; position: relative; padding-bottom: 18px; }
    li:last-child { padding-bottom: 0; }
    li:not(:last-child)::after { content: ''; position: absolute; left: 14px; top: 30px; bottom: 2px; width: 2px; background: var(--line); }
    li.done:not(:last-child)::after { background: var(--g-600); }
    .dot {
      flex: none; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center;
      font-size: 13px; font-weight: 700; background: #fff; border: 2px solid var(--line); color: var(--ink-3);
    }
    li.done .dot { background: var(--g-600); border-color: var(--g-600); color: #fff; }
    li.active .dot { border-color: var(--gold); color: var(--gold-deep); background: var(--gold-soft); box-shadow: 0 0 0 5px rgba(217, 162, 58, .18); }
    .txt { display: flex; flex-direction: column; padding-top: 3px; }
    strong { font-size: 14.5px; font-weight: 600; }
    small { color: var(--ink-3); font-size: 13px; }
    li.active strong { color: var(--gold-deep); }
    .preview strong { color: var(--ink-2); }
  `,
})
export class ProcessSteps {
  stage = input(0);
  preview = input(false);
  email = input('');
  protected steps = computed(() => [
    { label: 'Emprunt enregistré', hint: 'Processus Camunda démarré' },
    { label: 'Confirmation envoyée', hint: this.email() ? 'E-mail à ' + this.email() : 'E-mail au membre' },
    { label: 'Retour du livre', hint: 'En attente de la restitution' },
  ]);
}
