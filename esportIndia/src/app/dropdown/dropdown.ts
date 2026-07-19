import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
})
export class Dropdown {
  readonly items = input.required<string[]>();
  readonly placeholder = input<string>('Select an option');
  readonly selectedItem = input<string | null>(null);
  readonly selectionChange = output<string | null>();

  readonly isOpen = signal(false);

  toggle() {
    this.isOpen.update(v => !v);
  }

  selectItem(item: string | null) {
    this.selectionChange.emit(item);
    this.isOpen.set(false);
  }
}
