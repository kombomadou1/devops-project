import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Nav } from '../nav/nav';
import { Sidenav } from '../sidenav/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../services/user.service';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users-create',
  imports: [
    Nav,
    Sidenav,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  templateUrl: './users-create.html',
  styleUrl: './users-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersCreate {
  userForm: FormGroup;
  loading = false;
  error?: string;

  constructor(private fb: FormBuilder, private userService: User, private snackBar: MatSnackBar) {
    this.userForm = this.fb.group({
      lastname: ['', Validators.required],
      firstname: ['', Validators.required],
      age: ['', Validators.required, Validators.min(1)],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.loading = true;
    this.error = undefined;

    this.userService.createUser(this.userForm.value).subscribe({
      next: (res) => {
        this.showSuccess('Utilisateur créé avec succès');
        this.userForm.reset();
        console.log(this.userForm.value);
      },
      error: (err) => {
        this.loading = false;
        // this.error = 'Une erreur est survenue lors de la création.';
        // console.error(err);

        this.showError('Une erreur est survenue lors de la création');
      },
    });
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }
}
