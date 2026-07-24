import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.html',
})
export class News {
  @Input() game: string = 'all';
  @Input() gameName: string = 'All';

  // Placeholder news data for SEO and UI
  newsArticles = [
    {
      title: 'Sentinels announce new roster for VCT 2026',
      excerpt: 'The organization is making huge moves ahead of the Americas League, signing two upcoming stars from Challengers.',
      date: 'July 22, 2026',
      category: 'Valorant',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'CS2 Major Championship: Schedule and Teams',
      excerpt: 'Everything you need to know about the upcoming Counter-Strike 2 Major, including brackets, prize pool, and predictions.',
      date: 'July 20, 2026',
      category: 'CS2',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'The Rise of PUBG Mobile in India',
      excerpt: 'A deep dive into how mobile esports continues to dominate the Indian gaming ecosystem with record-breaking viewership.',
      date: 'July 18, 2026',
      category: 'PUBG',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'Dota 2: The International Prize Pool Update',
      excerpt: 'The community has once again rallied together, pushing the prize pool to new heights for this years grand event.',
      date: 'July 15, 2026',
      category: 'Dota 2',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800',
    }
  ];
}
