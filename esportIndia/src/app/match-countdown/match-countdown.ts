import { isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-match-countdown',
  standalone: true,
  templateUrl: './match-countdown.html',
  styleUrl: './match-countdown.css',
})
export class MatchCountdown implements OnInit, OnDestroy {
  readonly targetTime = input.required<string>();
  readonly label = signal('Starts soon');

  private readonly platformId = inject(PLATFORM_ID);
  private intervalId: ReturnType<typeof setInterval> | undefined;

  ngOnInit(): void {
    this.updateLabel();
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => this.updateLabel(), 1_000);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private updateLabel(): void {
    const milliseconds = new Date(this.targetTime()).getTime() - Date.now();
    if (!Number.isFinite(milliseconds)) {
      this.label.set('Time TBA');
      return;
    }
    if (milliseconds <= 0) {
      this.label.set('Starting now');
      return;
    }

    const totalSeconds = Math.floor(milliseconds / 1_000);
    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;

    const clock = [hours, minutes, seconds].map((unit) => unit.toString().padStart(2, '0')).join(':');
    this.label.set(days > 0 ? `Starts in ${days}d ${clock}` : `Starts in ${clock}`);
  }
}
