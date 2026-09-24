import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Sidenav } from '../sidenav/sidenav';
import { Nav } from '../nav/nav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-associations-form-add',
  imports: [Nav, Sidenav, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './associations-form-add.html',
  styleUrl: './associations-form-add.css',
})
export class AssociationsFormAdd{
  associationName: string = "";
  
  private _snackBar = inject(MatSnackBar);
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }
  constructor(private http: HttpClient, 
    private changeDetector: ChangeDetectorRef,
    private router: Router
  ){}

  createAssociation(form: NgForm): void {
      this.http.post(environment.base_url+'/associations', {name : this.associationName}, { observe: 'response' })
      .subscribe({
        next: (response) => {
          console.log('created', response.body);
          form.resetForm();
          this.openSnackBar('Association ajoutée avec succès', 'X');
        },
        error: (err) => {
          console.error('Erreur création association', err);
          this.openSnackBar('Erreur création association', 'X');
        }
      });
    }
}
