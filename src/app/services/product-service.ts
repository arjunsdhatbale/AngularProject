import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductDto } from '../models/product.model';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/product';

  saveProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/save-product`, product);
  }

  updateProduct(id: number, productDto: ProductDto): Observable<ProductDto> {
    return this.http.patch<ProductDto>(
      `${this.baseUrl}/update-product/${id}`,
      productDto,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/get-all-products`);
  }

  getProductById(id: number): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.baseUrl}/get-product/${id}`);
  }

  deleteProductById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete-product/${id}`);
  }
}
