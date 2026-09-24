import { ChangeDetectorRef, Component, numberAttribute } from '@angular/core';
import { Association } from '../models/associations.model';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Sidenav } from '../sidenav/sidenav';
import { Nav } from '../nav/nav';
import { MatTableModule } from '@angular/material/table';
import { Minutes } from '../models/minutes.model';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-association-details',
  imports: [MatTableModule, Nav, Sidenav, MatCardModule, MatButtonModule, MatIconModule, MatTabsModule],
  templateUrl: './association-details.html',
  styleUrl: './association-details.css',
})
export class AssociationDetails {
  displayedMembersColumns: string[] = ['id', 'name', 'firstname', 'age', 'role', 'actions'];
  displayedMinutesColumns: string[] = ['idMinute', 'date', 'content'];
  dataSource!: Association ;
  minutes: Minutes[]= [] ;
  idUrl: string = "";

  constructor(private http: HttpClient, 
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    
    this.route.url.subscribe(res => {
      this.idUrl = res[1]?.path;
      if (!this.idUrl) return;
      const memberRequest: Observable<any> = this.http.get(environment.base_url + '/associations/' + this.idUrl, { observe: 'response' });
        lastValueFrom(memberRequest).then(response => {this.dataSource = response.body; this.changeDetector.detectChanges();
      });
      const minuteRequest: Observable<any> = this.http.get(environment.base_url + '/associations/' + this.idUrl + '/minutes', { observe: 'response' });
        lastValueFrom(minuteRequest).then(response => {this.minutes = response.body; this.changeDetector.detectChanges(); console.log(this.minutes);
        
      });
    });

      
    }

    goToUser(id: number): void {
      this.router.navigateByUrl('/users/'+id);
    }
}
