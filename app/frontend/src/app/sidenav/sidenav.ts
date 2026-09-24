import { ChangeDetectionStrategy, Component, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTreeModule } from '@angular/material/tree';
import { Subscription } from 'rxjs';
import { SidenavService } from '../services/sidenav.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatSidenavModule, MatButtonModule, MatTreeModule, MatIconModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidenav implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;
  private sub = new Subscription();

  constructor(private sidenavService: SidenavService, private router: Router /*, private sidenavService?: SidenavService */) {}
ngOnInit(): void {
    // this.drawer.opened;
  }
  ngAfterViewInit(): void {
    this.sub.add(this.sidenavService.toggle$.subscribe(() => this.drawer.toggle()));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    /* cleanup si besoin */
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  showFiller = false;

  dataSource = MENU;

  childrenAccessor = (node: Menu) => node.children ?? [];

  hasChild = (_: number, node: Menu) => !!node.children && node.children.length > 0;

  toggle(): void {
    this.drawer.toggle();
  }
}

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface Menu {
  name: string;
  route?: string;
  children?: Menu[];
}

/* exemples avec routes */
const MENU: Menu[] = [
  { name: 'Utilisateurs',
    children: [
        { name: 'Liste',  route: '/users'},
        { name: 'Ajouter', route: '/users/create' },
      ],
  },
  { name: 'Associations',
    children: [
        { name: 'Liste',  route: '/associations'},
        { name: 'Ajouter',  route: '/associations/create'},
      ],
  },
];
