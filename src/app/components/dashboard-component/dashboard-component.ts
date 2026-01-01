import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, filter, debounceTime } from 'rxjs/operators';

// Angular Material Imports - REQUIRED FOR THE TEMPLATE
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { DashboardService } from '../../services/dashboard-service';

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

export interface Breadcrumb {
  label: string;
  route: string;
}

export interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  change: number;
}

export interface Notification {
  id: number;
  title: string;
  icon: string;
  time: string;
  read: boolean;
  type?: string;
}

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    // Material Modules
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Sidebar state
  isSidebarCollapsed = false;
  
  // User info
  userName: string = 'John Doe';
  userEmail: string = 'john.doe@example.com';
  
  // Menu items - Updated to match your routes
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/user', icon: 'dashboard' },
    { label: 'Users', route: '/user', icon: 'people' },
    { label: 'Products', route: '/product', icon: 'inventory_2' },
    { label: 'Drivers', route: '/driver', icon: 'local_shipping' },
    { label: 'Orders', route: '/order', icon: 'shopping_cart' }
  ];
  
  // Page state
  pageTitle: string = 'Dashboard';
  breadcrumbs: Breadcrumb[] = [];
  
  // Search
  searchQuery: string = '';
  private searchSubject = new Subject<string>();
  
  // Stats cards
  showStats: boolean = true;
  stats: StatCard[] = [
    {
      label: 'Total Revenue',
      value: '$45,231',
      icon: 'attach_money',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      change: 12.5
    },
    {
      label: 'Total Users',
      value: '1,234',
      icon: 'people',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      change: 8.2
    },
    {
      label: 'Active Orders',
      value: '89',
      icon: 'shopping_cart',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      change: -3.1
    },
    {
      label: 'Total Drivers',
      value: '45',
      icon: 'local_shipping',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      change: 5.7
    }
  ];
  
  // Notifications
  notifications: Notification[] = [
    {
      id: 1,
      title: 'New order received',
      icon: 'shopping_cart',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 2,
      title: 'User registration',
      icon: 'person_add',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'Payment successful',
      icon: 'check_circle',
      time: '2 hours ago',
      read: true
    }
  ];
  
  hasUnreadNotifications: boolean = true;
  
  // Theme
  isDarkMode: boolean = false;
  
  // Loading state
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
    this.setupRouterSubscription();
    this.setupSearchSubscription();
    this.checkSidebarState();
    this.checkThemePreference();
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load user data from service or localStorage
   */
  private loadUserData(): void {
    this.dashboardService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        user => {
          if (user) {
            this.userName = user.name || 'User';
            this.userEmail = user.email || '';
          }
        },
        error => {
          console.error('Error loading user data:', error);
        }
      );
  }

  /**
   * Load dashboard statistics and data
   */
  private loadDashboardData(): void {
    this.isLoading = true;
    
    this.dashboardService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          if (data && data.stats) {
            this.stats = data.stats;
          }
          this.isLoading = false;
        },
        error => {
          console.error('Error loading dashboard data:', error);
          this.isLoading = false;
        }
      );
  }

  /**
   * Load notifications from service
   */
  private loadNotifications(): void {
    this.dashboardService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        notifications => {
          this.notifications = notifications;
          this.hasUnreadNotifications = notifications.some(n => !n.read);
        },
        error => {
          console.error('Error loading notifications:', error);
        }
      );
  }

  /**
   * Setup router subscription to update breadcrumbs and page title
   */
  private setupRouterSubscription(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateBreadcrumbs();
        this.updatePageTitle();
      });
    
    // Initial update
    this.updateBreadcrumbs();
    this.updatePageTitle();
  }

  /**
   * Setup search with debounce
   */
  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.performSearch(query);
      });
  }

  /**
   * Update breadcrumbs based on current route
   */
  private updateBreadcrumbs(): void {
    const currentUrl = this.router.url;
    const segments = currentUrl.split('/').filter(s => s);
    
    this.breadcrumbs = segments.map((segment, index) => {
      const route = '/' + segments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, route };
    });
  }

  /**
   * Update page title based on current route
   */
  private updatePageTitle(): void {
    const currentUrl = this.router.url;
    const activeItem = this.menuItems.find(item => currentUrl.includes(item.route));
    this.pageTitle = activeItem ? activeItem.label : 'Dashboard';
  }

  /**
   * Check if route is active
   */
  isActiveRoute(route: string): boolean {
    return this.router.url.includes(route);
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', JSON.stringify(this.isSidebarCollapsed));
  }

  /**
   * Check sidebar state from localStorage
   */
  private checkSidebarState(): void {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      this.isSidebarCollapsed = JSON.parse(savedState);
    }
  }

  /**
   * Handle search input
   */
  onSearch(): void {
    this.searchSubject.next(this.searchQuery);
  }

  /**
   * Perform actual search
   */
  private performSearch(query: string): void {
    if (!query || query.trim() === '') {
      return;
    }

    this.dashboardService.search(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        results => {
          console.log('Search results:', results);
          // Handle search results - navigate or display
        },
        error => {
          console.error('Search error:', error);
        }
      );
  }

  /**
   * Handle notification click
   */
  handleNotification(notification: Notification): void {
    // Mark as read
    notification.read = true;
    this.dashboardService.markNotificationAsRead(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.hasUnreadNotifications = this.notifications.some(n => !n.read);
        },
        error => {
          console.error('Error marking notification as read:', error);
        }
      );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.dashboardService.markAllNotificationsAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.notifications.forEach(n => n.read = true);
          this.hasUnreadNotifications = false;
        },
        error => {
          console.error('Error marking all notifications as read:', error);
        }
      );
  }

  /**
   * Toggle theme (dark/light mode)
   */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  /**
   * Check theme preference from localStorage
   */
  private checkThemePreference(): void {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      this.isDarkMode = JSON.parse(savedTheme);
      if (this.isDarkMode) {
        document.body.classList.add('dark-theme');
      }
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.dashboardService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          localStorage.clear();
          this.router.navigate(['/login']);
        },
        error => {
          console.error('Logout error:', error);
          // Force logout even if API fails
          localStorage.clear();
          this.router.navigate(['/login']);
        }
      );
  }
}