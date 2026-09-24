import { Routes } from '@angular/router';
import { UsersList } from './users-list/users-list';
import { UsersCreate } from './users-create/users-create';
import { UsersUpdate } from './users-update/users-update';
import { UsersDetails } from './users-details/users-details';
import { Login } from './login/login';
import { authGuard } from './guards/auth-guard';
import { AssociationsList } from './associations-list/associations-list';
import { AssociationDetails } from './association-details/association-details';
import { AssociationsFormAdd } from './associations-form-add/associations-form-add';
import { AssociationsUserAdd } from './associations-user-add/associations-user-add';
import { AssociationsFormUpdate } from './associations-form-update/associations-form-update';

export const routes: Routes = [
    { path: 'users', component: UsersList, canActivate: [authGuard] },
    { path: 'users/create', component: UsersCreate },
    { path: 'users/:id/edit', component: UsersUpdate },
    { path: 'users/:id/details', component: UsersDetails },
    { path: 'associations/create', component: AssociationsFormAdd, canActivate: [authGuard] },
    { path: 'associations/update/:id', component: AssociationsFormUpdate, canActivate: [authGuard] },
    { path: 'associations/:id', component: AssociationDetails, canActivate: [authGuard] },
    { path: 'associations/:id/create-role', component: AssociationsUserAdd, canActivate: [authGuard] },
    { path: 'associations', component: AssociationsList, canActivate: [authGuard] },
    { path: '', component: Login }
];
