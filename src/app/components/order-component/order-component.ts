import { Component, inject, OnInit, signal } from '@angular/core';
import { OrderService } from '../../services/order-service';
import { Order, OrderDto } from '../../models/order.model';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-component',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './order-component.html',
  styleUrl: './order-component.css'
})
export class OrderComponent implements OnInit {

  private readonly orderService = inject(OrderService);
  
  orders = signal<Order[]>([]);
  selectedOrder = signal<Order | null>(null);
  isEditMode = signal(false);
  showForm = signal(false);
  isLoading = signal(false);
  
  newOrder: Order = {
    orderName: '',
    price: 0
  };

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.isLoading.set(true);
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
        console.log('Orders loaded successfully', data);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error loading orders', error);
        alert('Failed to load orders. Please check if the backend is running.');
      }
    });
  }

  saveOrder(): void {
    if (this.validateOrder(this.newOrder)) {
      this.isLoading.set(true);
      this.orderService.saveOrder(this.newOrder).subscribe({
        next: (data) => {
          console.log('Order saved successfully', data);
          alert('Order created successfully!');
          this.resetForm();
          this.loadAllOrders();
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error saving order', error);
          alert('Failed to save order. Please try again.');
        }
      });
    }
  }

  editOrder(order: Order): void {
    this.selectedOrder.set({ ...order });
    this.isEditMode.set(true);
    this.showForm.set(true);
  }

  updateOrder(): void {
    const order = this.selectedOrder();
    if (order && order.id) {
      const orderDto: OrderDto = {
        orderName: order.orderName,
        price: order.price
      };

      this.isLoading.set(true);
      this.orderService.updateOrder(order.id, orderDto).subscribe({
        next: (data) => {
          console.log('Order updated successfully', data);
          alert('Order updated successfully!');
          this.resetForm();
          this.loadAllOrders();
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error updating order', error);
          alert('Failed to update order. Please try again.');
        }
      });
    }
  }

  deleteOrder(id: number | undefined): void {
    if (id && confirm('Are you sure you want to delete this order?')) {
      this.isLoading.set(true);
      this.orderService.deleteOrderById(id).subscribe({
        next: () => {
          console.log('Order deleted successfully');
          alert('Order deleted successfully!');
          this.loadAllOrders();
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error deleting order', error);
          alert('Failed to delete order. Please try again.');
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
    this.selectedOrder.set(null);
    this.resetFormFields();
  }

  resetFormFields(): void {
    this.newOrder = {
      orderName: '',
      price: 0
    };
  }

  validateOrder(order: Order): boolean {
    if (!order.orderName || order.orderName.trim() === '') {
      alert('Order name is required!');
      return false;
    }
    if (order.price === null || order.price === undefined) {
      alert('Price is required!');
      return false;
    }
    if (order.price < 0) {
      alert('Price must be a positive number!');
      return false;
    }
    return true;
  }
}