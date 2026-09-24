import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { routes as appRoutes } from '../app.routes';

@Injectable({ providedIn: 'root' })
export class RouteService {
  private readonly routes = appRoutes;

  constructor(private router: Router) {}

  getRoutes() {
    return this.routes;
  }

  goToUsers(): Promise<boolean> {
    return this.router.navigateByUrl('/users');
  }

  goToLogin(): Promise<boolean> {
    return this.router.navigateByUrl('/');
  }
}