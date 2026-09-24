import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Sidenav } from '../sidenav/sidenav';
import { Nav } from '../nav/nav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';
import { Association } from '../models/associations.model';

@Component({
  selector: 'app-associations-form-update',
  imports: [Nav, Sidenav, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './associations-form-update.html',
  styleUrl: './associations-form-update.css',
})
export class AssociationsFormUpdate {
  associationName: string = "";
  dataSource!: Association ;
  
  private _snackBar = inject(MatSnackBar);
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }
  idUrl: string = "";
  constructor(private http: HttpClient, 
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
      this.loadAssociation()
      }

  updateAssociation(form: NgForm): void {
    const body = { name: this.associationName }; 

    this.http.put(environment.base_url + '/associations/' + this.dataSource.id, body, {
      observe: 'response'
    })
    .subscribe({
      next: (response) => {
        console.log('updated', response.body);
        this.loadAssociation();
        this.openSnackBar('Association mise à jour avec succès', 'X');
      },
      error: (err) => {
        console.error('Erreur mise à jour association', err);
        this.openSnackBar('Erreur mise à jour association', 'X');
      }
    });
  }

  loadAssociation():void{
    this.route.url.subscribe(res => {
        this.idUrl = res[2]?.path;
        if (!this.idUrl) return;
        const memberRequest: Observable<any> = this.http.get(environment.base_url + '/associations/' + this.idUrl, { observe: 'response' });
          lastValueFrom(memberRequest).then(response => {this.dataSource = response.body;this.associationName=this.dataSource.name; this.changeDetector.detectChanges();
        });
        
      });
  }
}
