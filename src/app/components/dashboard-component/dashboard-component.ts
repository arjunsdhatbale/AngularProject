import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../../models/menu.model';

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css'
})
export class DashboardComponent {

   menuItems: MenuItem[] = [
    { label: 'Users', route: '/user', icon: 'users' },
    { label: 'Products', route: '/product', icon: 'products' },
     
  ];

}
