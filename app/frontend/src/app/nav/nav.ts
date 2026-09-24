import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TokenStorageService } from '../services/token-storage.service';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { SidenavService } from '../services/sidenav.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, MatTreeModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav implements OnInit {
  constructor(private tokenStorageService: TokenStorageService, private route: Router, private sidenavService: SidenavService) {}

  public isLogged: boolean = false;
  showFiller = false;

  ngOnInit(): void {
    this.isLogged = this.tokenStorageService.isLogged();
    
  }

  logout(): void {
    this.tokenStorageService.clear();
    this.route.navigateByUrl('/');
  }

  toggleSidenav(): void {
    this.sidenavService.toggle();
  }
}

