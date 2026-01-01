import { Routes } from '@angular/router';
import { UserComponent } from './components/user-component/user-component';
import { DashboardComponent } from './components/dashboard-component/dashboard-component';
import { ProductComponent } from './components/product-component/product-component';
import { DriverComponent } from './components/driver-component/driver-component';
import { OrderComponent } from './components/order-component/order-component';

export const routes: Routes = [

    //     { path: '', component: DashboardComponent },
    //     { path: 'user', component: UserComponent },  
    //     { path: 'product', component: ProductComponent},
    //     { path: 'driver', component: DriverComponent },
    //     { path: 'order', component: OrderComponent},
    //     { path: '**', redirectTo: '' }
    // ];

    {
        path: '',
        component: DashboardComponent,
        children: [
            // Default route - you can create a home component or redirect to any default view
            { path: '', redirectTo: 'user', pathMatch: 'full' },

            // Child routes that will render inside the dashboard's router-outlet
            { path: 'user', component: UserComponent },
            { path: 'product', component: ProductComponent },
            { path: 'driver', component: DriverComponent },
            { path: 'order', component: OrderComponent }
        ]
    },

    // Catch-all route
    { path: '**', redirectTo: '' }
];