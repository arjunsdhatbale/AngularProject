import { Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../services/user-service';
import { User, UserDto } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-component',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './user-component.html',
  styleUrls: ['./user-component.css']
})
export class UserComponent implements OnInit  {

  private readonly userService = inject(UserService);
  
  users = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  isEditMode = signal(false);
  showForm = signal(false);
  isLoading = signal(false);
  
  newUser: User = {
    userName: '',
    email: '',
    password: ''
  };

  ngOnInit(): void {
    this.loadAllUsers();
  }

  loadAllUsers(): void {
    this.isLoading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
        console.log('Users loaded successfully', data);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error loading users', error);
        alert('Failed to load users. Please check if the backend is running.');
      }
    });
  }

  get activeUser(): User {
    return this.isEditMode() ? this.selectedUser()! : this.newUser;
  }


  saveUser(): void {
    if (this.validateUser(this.newUser)) {
      this.isLoading.set(true);
      this.userService.saveUser(this.newUser).subscribe({
        next: (data) => {
          console.log('User saved successfully', data);
          alert('User created successfully!');
          this.resetForm();
          this.loadAllUsers();
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error saving user', error);
          alert('Failed to save user. Please try again.');
        }
      });
    }
  }

  editUser(user: User): void {
    this.selectedUser.set({ ...user });
    this.isEditMode.set(true);
    this.showForm.set(true);
  }

  updateUser(): void {
    const user = this.selectedUser();
    if (user && user.id) {
      const userDto: UserDto = {
        userName: user.userName,
        email: user.email,
        password: user.password
      };

      this.isLoading.set(true);
      this.userService.updateUser(user.id, userDto).subscribe({
        next: (data) => {
          console.log('User updated successfully', data);
          alert('User updated successfully!');
          this.resetForm();
          this.loadAllUsers();
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error updating user', error);
          alert('Failed to update user. Please try again.');
        }
      });
    }
  }

  deleteUser(id: number | undefined): void {
    if (id && confirm('Are you sure you want to delete this user?')) {
      this.isLoading.set(true);
      this.userService.deleteUserById(id).subscribe({
        next: () => {
          console.log('User deleted successfully');
          alert('User deleted successfully!');
          this.loadAllUsers();
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error deleting user', error);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }

  showAddForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.resetFormFields();
  }

  cancelForm(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.showForm.set(false);
    this.isEditMode.set(false);
    this.selectedUser.set(null);
    this.resetFormFields();
  }

  resetFormFields(): void {
    this.newUser = {
      userName: '',
      email: '',
      password: ''
    };
  }

  validateUser(user: User): boolean {
    if (!user.userName || user.userName.trim() === '') {
      alert('Username is required!');
      return false;
    }
    if (!user.email || user.email.trim() === '') {
      alert('Email is required!');
      return false;
    }
    if (!user.password || user.password.trim() === '') {
      alert('Password is required!');
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(user.email)) {
      alert('Please enter a valid email address!');
      return false;
    }
    return true;
  }

}
