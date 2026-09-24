import { Component, numberAttribute, OnInit } from '@angular/core';
import { Nav } from '../nav/nav';
import { Sidenav } from '../sidenav/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users-details',
  imports: [Nav, Sidenav, MatCardModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './users-details.html',
  styleUrl: './users-details.css',
})
export class UsersDetails implements OnInit {
  userId!: number;
  user: any;
  associations: Map<number, string> = new Map();
  loading = false;
  error?: string;

  constructor(
    private route: ActivatedRoute,
    private userService: User,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    // Charger les associations
    this.userService.getAllAssociations().subscribe({
      next: (associations: any[]) => {
        console.log('Associations reçues:', associations);
        associations.forEach((assoc) => {
          this.associations.set(assoc.id, assoc.name);
        });
        console.log('Map associations:', this.associations);
        this.chargerUtilisateur();
      },
      error: (err) => {
        this.showError("Impossible de cahrger l'utilisateur ");
        this.loading = false;
        console.error('Erreur associations:', err);
      },
    });
  }

  // charger les utilisateurs
  chargerUtilisateur() {
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        this.user = users.find((u) => u.id === this.userId);
        console.log('USER TROUVE=>', this.user);

        // recuperer les roles et noms d'association liee
        if (!this.user) {
          this.showError("Impossible de cahrger l'utilisateur ");
          this.loading = false;
          return;
        }

        if (this.user.roles && Array.isArray(this.user.roles) && this.user.roles.length > 0) {
          console.log('Roles avant mapping', this.user.roles);

          this.user.roles = this.user.roles.map((role: any) => ({
            ...role,
            associationName: this.associations.get(role.idAssociation) || 'Association inconnue',
          }));
          console.log('Roles apres mapping', this.user.roles);
        } else {
          console.log('Pas de rôles pour cet utilisateur');
          this.user.roles = [];
        }

        this.loading = false;
      },
      error: (err) => {
        this.showError("Impossible de charger l'utilisateur");
        this.loading = false;
        console.error('Erreur utilisateur:', err);
      },
    });
  }

  backToList() {
    this.router.navigate(['/users']);
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, '', {
      duration: 2000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, '', {
      duration: 2000,
      panelClass: ['error-snackbar'],
    });
  }
}
