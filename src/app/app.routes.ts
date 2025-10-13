import { Routes } from '@angular/router';
import { UserComponent } from './components/user-component/user-component';

export const routes: Routes = [

    { path: '', component: UserComponent }, // default route
    { path: '**', redirectTo: '' }
];
