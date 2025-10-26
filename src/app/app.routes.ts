import { Routes } from '@angular/router';
import { UserComponent } from './components/user-component/user-component';
import { DashboardComponent } from './components/dashboard-component/dashboard-component';
import { ProductComponent } from './components/product-component/product-component';

export const routes: Routes = [

    { path: '', component: DashboardComponent },
    { path: 'user', component: UserComponent },  
    { path: 'product', component: ProductComponent},
    { path: '**', redirectTo: '' }
];
