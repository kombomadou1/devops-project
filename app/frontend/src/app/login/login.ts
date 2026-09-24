import { Component } from '@angular/core';
import { ApiHelperService } from '../services/app-helper.service';
import { TokenStorageService } from '../services/token-storage.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  public errorMessage: string ="";
  
  constructor(private api: ApiHelperService,
    private tokenStorageService: TokenStorageService,
    private router: Router
  ){}
  login(): void {
      const username: string = (document.getElementById('username') as HTMLInputElement).value;
      const password: string = (document.getElementById('password') as HTMLInputElement).value;
      this.api.post({endpoint: '/auth/login', data: { username, password }}).then(response => 
        {
          console.log("nonon");
          this.tokenStorageService.save(response.access_token);

          if(this.tokenStorageService.isLogged()){
            this.router.navigateByUrl('/users');
          }else{
            
            this.errorMessage ="Nom d'utilisateur ou mot de passe incorrecte!";
          }
          
        }).catch(err => {
            if (err && (err.status === 401 || err.status === '401')) {
              console.log("une fois");
              
            this.errorMessage = 'Identifiants incorrects';
            } else {
              this.errorMessage ="Nom d'utilisateur ou mot de passe incorrecte!";
            // this.errorMessage = 'Erreur réseau, réessayez';
            }});
        
  }

}
