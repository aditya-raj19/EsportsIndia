import { Component, input, inject, signal, computed, OnInit, OnChanges, SimpleChanges, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tournament, TournamentService } from '../services/tournament.service';
import { GameSlug } from '../services/matchservice';
import { SearchComponent } from '../shared/search/search.component';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchComponent],
  templateUrl: './tournaments.html',
  styleUrl: './tournaments.css',
})
export class Tournaments implements OnInit, OnChanges {
  readonly game = input.required<GameSlug>();
  readonly gameName = input.required<string>();

  private readonly tournamentService = inject(TournamentService);
  private readonly platformId = inject(PLATFORM_ID);
  
  readonly tournaments = signal<Tournament[]>([]);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  activeTab = signal<'running' | 'upcoming'>('running');
  searchQuery = signal('');
  selectedTier = signal('All');

  readonly filteredTournaments = computed(() => {
    let list = this.tournaments();
    const query = this.searchQuery().toLowerCase().trim();
    const tier = this.selectedTier();

    if (query) {
      list = list.filter(t => 
        (t.name && t.name.toLowerCase().includes(query)) ||
        (t.leagueName && t.leagueName.toLowerCase().includes(query)) ||
        (t.videogameName && t.videogameName.toLowerCase().includes(query))
      );
    }

    if (tier !== 'All') {
      list = list.filter(t => t.tier && t.tier.toLowerCase() === tier.toLowerCase());
    }

    return list;
  });

  ngOnInit(): void {
    this.fetchTournaments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['game'] && !changes['game'].isFirstChange()) {
      this.fetchTournaments();
    }
  }

  setTab(tab: 'running' | 'upcoming') {
    this.activeTab.set(tab);
    this.fetchTournaments();
  }

  private fetchTournaments(): void {
    if (!this.game()) return;
    this.loading.set(true);
    this.errorMsg.set(null);

    const req$ = this.activeTab() === 'running' 
      ? this.tournamentService.getRunningTournaments(this.game())
      : this.tournamentService.getUpcomingTournaments(this.game());

    req$.subscribe({
      next: (data) => {
        this.tournaments.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Unable to load tournaments at this time.');
        this.loading.set(false);
      }
    });
  }

  getTierColor(tier: string): string {
    const t = tier?.toLowerCase() || '';
    switch (t) {
      case 's': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'a': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'b': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'c': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'd': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-white/5 text-gray-400 border-white/10';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatPrizePool(prize: string): string {
    if (!prize || prize.trim() === '' || prize.toLowerCase() === 'tba') return 'TBA';
    
    const numMatch = prize.replace(/,/g, '').match(/\d+/);
    if (!numMatch) return prize; 

    const amount = parseInt(numMatch[0], 10);
    let inrAmount = amount;
    
    const lower = prize.toLowerCase();
    if (lower.includes('dollar') || lower.includes('usd') || lower.includes('$')) {
      inrAmount = amount * 84; 
    } else if (lower.includes('euro') || lower.includes('eur') || lower.includes('€')) {
      inrAmount = amount * 92;
    } else if (lower.includes('krw') || lower.includes('won')) {
      inrAmount = amount * 0.06;
    } else if (lower.includes('yuan') || lower.includes('rmb') || lower.includes('cny')) {
      inrAmount = amount * 11.5;
    } else if (!lower.includes('inr') && !lower.includes('rupee')) {
      inrAmount = amount * 84; // Default to USD conversion if unknown
    }

    if (inrAmount >= 10000000) {
      return `₹${(inrAmount / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`;
    } else if (inrAmount >= 100000) {
      return `₹${(inrAmount / 100000).toFixed(1).replace(/\.0$/, '')} L`;
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(inrAmount);
  }
}
