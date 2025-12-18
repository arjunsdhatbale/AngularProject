import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Order, OrderDto } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/order';

  saveOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/save-order`, order);
  }

  updateOrder(id: number, orderDto: OrderDto): Observable<OrderDto> {
    return this.http.patch<OrderDto>(
      `${this.baseUrl}/update-order/${id}`,
      orderDto,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/get-all-orders`);
  }

  getOrderById(id: number): Observable<OrderDto> {
    return this.http.get<OrderDto>(`${this.baseUrl}/get-order/${id}`);
  }

  deleteOrderById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete-order/${id}`);
  }
}