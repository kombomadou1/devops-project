import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Nav } from '../nav/nav';
import { Sidenav } from '../sidenav/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, NgForm } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { lastValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Association } from '../models/associations.model';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserData } from '../users-list/users-list';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-associations-user-add',
  imports: [Nav, Sidenav, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, MatSelectModule],
  templateUrl: './associations-user-add.html',
  styleUrl: './associations-user-add.css',
})
export class AssociationsUserAdd implements OnInit{
    userSelected: string= "";
    roleName: string= "";
    associationData!: Association;
    userData: UserData[]=[];
    idUrl: string = "";

     private _snackBar = inject(MatSnackBar);
    openSnackBar(message: string, action: string) {
      this._snackBar.open(message, action);
    }

    constructor(private http: HttpClient, 
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute 
  ){}

  ngOnInit(): void {
      this.route.url.subscribe(res => {
        this.idUrl = res[1]?.path;
        if (!this.idUrl) return;
        const associationRequest: Observable<any> = this.http.get(environment.base_url + '/associations/' + this.idUrl, { observe: 'response' });
          lastValueFrom(associationRequest).then(response => {this.associationData = response.body; this.changeDetector.detectChanges();
          });

          const userRequest: Observable<any> = this.http.get(environment.base_url + '/users', { observe: 'response' });
            lastValueFrom(userRequest).then(response => {this.userData = response.body; this.changeDetector.detectChanges();
            });
      });

      }

  addUserToAssociation(form: NgForm):void{
    this.http.post(environment.base_url+'/roles', {name : this.roleName, idUser: this.userSelected, idAssociation: this.associationData.id}, { observe: 'response' })
          .subscribe({
            next: (response) => {
              console.log('created', response.body);
              form.resetForm();
              this.openSnackBar('Role ajoutée avec succès', 'X');
            },  
            error: (err) => {
              console.error('Erreur création rôle', err);
              this.openSnackBar('Erreur création rôle', 'X');
            }
          });
  }
}
