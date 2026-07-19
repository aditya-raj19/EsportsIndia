import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full" [ngClass]="containerClass">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
      <input type="text" [ngModel]="query" (ngModelChange)="onQueryChange($event)"
             class="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 sm:text-sm transition-colors"
             [placeholder]="placeholder">
    </div>
  `
})
export class SearchComponent {
  @Input() query = '';
  @Input() placeholder = 'Search...';
  @Input() containerClass = 'md:w-96';
  
  @Output() queryChange = new EventEmitter<string>();

  onQueryChange(val: string) {
    this.query = val;
    this.queryChange.emit(val);
  }
}
