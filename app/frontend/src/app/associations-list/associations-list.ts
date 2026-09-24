import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Nav } from '../nav/nav';
import { Sidenav } from '../sidenav/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Association } from '../models/associations.model';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment.development';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-associations-list',
  imports: [MatTableModule, Nav, Sidenav, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './associations-list.html',
  styleUrl: './associations-list.css',
})
export class AssociationsList {
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource: Association[] = [];
  idAssociation: string = "";

  private _snackBar = inject(MatSnackBar);
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  constructor(private http: HttpClient, 
    private changeDetector: ChangeDetectorRef,
    private router: Router
  ){}

  ngOnInit(): void {
      this.loadList();
    }

    goToAssociation(id: string): void {
      this.router.navigateByUrl('/associations/'+id);
    }
    
    goToAddRole(id: string): void {
      this.router.navigateByUrl('/associations/'+id+'/create-role');
    }
    gotToUpdateForm(id: string): void {
      this.router.navigateByUrl('/associations/update/'+id);
    }
    
    searchAssociationById(): void {
      this.goToAssociation(this.idAssociation);
    }

    confirmDelete(id: string): void {
      const ok = window.confirm('Voulez-vous vraiment supprimer cette association ?');
      if (!ok) {
        return;
      }
      this.deleteAssociation(id);
    }

    deleteAssociation(id: string): void {
      this.http.delete(environment.base_url + '/associations/' + id, {
        observe: 'response'
      })
      .subscribe({
        next: (response) => {
          console.log('deleted', response);
          this.openSnackBar('Association supprimée avec succès', 'X');
          this.loadList();
        },
        error: (err) => {
          console.error('Erreur suppression association', err);
          this.openSnackBar('Erreur suppression association', 'X');
        }
      });
    }

    loadList():void{
      const request: Observable<any> = this.http.get(environment  
        .base_url + '/associations/', { observe: 'response' });
      lastValueFrom(request).then(response => {this.dataSource = response.body; this.changeDetector.detectChanges();
      });
    }

    
    
}
