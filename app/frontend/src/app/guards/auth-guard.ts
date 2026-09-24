import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
  const service = inject(TokenStorageService)

  if(service.isLogged()) {
    console.log("AuthGard : true");
    return true;
  }
 
  console.log("AuthGard : false");
  router.navigateByUrl('/');
  return false;
};
