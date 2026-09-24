import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../services/user.service';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { Nav } from '../nav/nav';
import { Sidenav } from '../sidenav/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { disabled } from '@angular/forms/signals';

@Component({
  selector: 'app-users-update',
  imports: [
    Nav,
    Sidenav,
    MatFormFieldModule,
    MatCardModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatInputModule,
  ],
  templateUrl: './users-update.html',
  styleUrl: './users-update.css',
})
export class UsersUpdate implements OnInit {
  editForm!: FormGroup;
  userId!: string;
  loading = false;
  error?: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: User,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      lastname: ['', Validators.required],
      firstname: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]],

      password: [{ value: '', disabled: true }],

      // password: ['', Validators.required],
    });
    // Recuperation de l'id
    this.userId = this.route.snapshot.paramMap.get('id') as string;

    // Chargement des donnees de l'utilisateur
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.editForm.patchValue({
          lastname: user.lastname,
          firstname: user.firstname,
          age: user.age,
          password: user.password,
        });
      },
      error: (err) => {
        console.error('Erreur de chargement');
      },
    });
  }

  onSubmit() {
    if (this.editForm.invalid) return;

    this.loading = true;

    const formValue = this.editForm.getRawValue();

    // Recuperation des valeurs du formulaire de modification
    const dataToSend = {
      lastname: this.editForm.get('lastname')?.value,
      firstname: this.editForm.get('firstname')?.value,
      age: Number(this.editForm.get('age')?.value),
    };

    this.userService.editUser(this.userId, dataToSend).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccess('Utilisteur mise a jour avec succès');
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.loading = false;
        this.showError('Erreur de la mise a jour');
      },
    });
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
