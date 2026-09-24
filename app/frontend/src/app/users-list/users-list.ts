import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { lastValueFrom, Observable } from 'rxjs';
import { Nav } from '../nav/nav';
import { Sidenav } from '../sidenav/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../environments/environment.development';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {  MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { User } from '../services/user.service';

@Component({
  selector: 'app-users-list',
  imports: [
    MatTableModule,
    Nav,
    Sidenav,
    MatCardModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    ConfirmDialog,
    MatSnackBarModule,
    CommonModule,
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersList implements OnInit {
  displayedColumns: string[] = ['id', 'lastname', 'firstname', 'age', 'actions'];
  dataSource: UserData[] = [];
  filteredData: UserData[] = [];
  bose: UserData[] = [new UserData(0, 'mdp1', 'Doe', 'John', 23), new UserData(1, 'mdp2', 'Doe', 'Jane', 32)];

  constructor(
    private http: HttpClient,
    private changeDetector: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private userService: User
  ) {}

  ngOnInit(): void {
    const request: Observable<any> = this.http.get(environment.base_url + '/users', {
      observe: 'response',
    });
    lastValueFrom(request).then((response) => {
      this.dataSource = response.body;
      this.filteredData = this.dataSource;
      this.changeDetector.detectChanges();
    });
  }

  onSearchId(value: string) {
    const id = value.trim();

    if (!id) {
      this.filteredData = this.dataSource;
    } else {
      const numericId = Number(id);
      this.filteredData = this.dataSource.filter((u) => u.id === numericId);
    }
    this.changeDetector.detectChanges();
  }

  openDeleteDialog(user: UserData) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: "Supprimer l'utilisateur",
        message: `Voulez-vous vraiment supprimer ${user.firstname} ${user.lastname}?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deleteUser(user);
      }
    });
  }

  deleteUser(user: UserData) {
    this.userService.deleteUser(String(user.id)).subscribe({
      next: () => {
        this.dataSource = this.dataSource.filter((u) => u.id !== user.id);
        this.changeDetector.detectChanges();

        this.snackbar.open('Utilisateur supprimé avec succès', '', {
          duration: 2000,
          panelClass: ['success-snackbar'],
        });
      },
      error: (err) => {
        console.error('Erreur suppression',err);
        this.snackbar.open('Erreur lors de la suppression', '', { 
          duration: 2000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
export class UserData {
  constructor(
    public id: number,
    public password: string,
    public lastname: string,
    public firstname: string,
    public age: number
  ) {}
}
