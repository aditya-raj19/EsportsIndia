import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  signOut() {
    window.location.href = '/login';
  }
}
