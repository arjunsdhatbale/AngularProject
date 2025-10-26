import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from '../../services/product-service';
import { Product, ProductDto } from '../../models/product.model';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-component',
  standalone: true,
  imports: [CommonModule, CurrencyPipe,FormsModule],
  templateUrl: './product-component.html',
  styleUrl: './product-component.css'
})
export class ProductComponent implements OnInit  {

   private readonly productService = inject(ProductService);
  
  products = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  isEditMode = signal(false);
  showForm = signal(false);
  isLoading = signal(false);
  
  newProduct: Product = {
    productName: '',
    price: 0
  };

  ngOnInit(): void {
    this.loadAllProducts();
  }

  loadAllProducts(): void {
    this.isLoading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
        console.log('Products loaded successfully', data);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error loading products', error);
        alert('Failed to load products. Please check if the backend is running.');
      }
    });
  }

  saveProduct(): void {
    if (this.validateProduct(this.newProduct)) {
      this.isLoading.set(true);
      this.productService.saveProduct(this.newProduct).subscribe({
        next: (data) => {
          console.log('Product saved successfully', data);
          alert('Product created successfully!');
          this.resetForm();
          this.loadAllProducts();
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error saving product', error);
          alert('Failed to save product. Please try again.');
        }
      });
    }
  }

  editProduct(product: Product): void {
    this.selectedProduct.set({ ...product });
    this.isEditMode.set(true);
    this.showForm.set(true);
  }

  updateProduct(): void {
    const product = this.selectedProduct();
    if (product && product.id) {
      const productDto: ProductDto = {
        productName: product.productName,
        price: product.price
      };

      this.isLoading.set(true);
      this.productService.updateProduct(product.id, productDto).subscribe({
        next: (data) => {
          console.log('Product updated successfully', data);
          alert('Product updated successfully!');
          this.resetForm();
          this.loadAllProducts();
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error updating product', error);
          alert('Failed to update product. Please try again.');
        }
      });
    }
  }

  deleteProduct(id: number | undefined): void {
    if (id && confirm('Are you sure you want to delete this product?')) {
      this.isLoading.set(true);
      this.productService.deleteProductById(id).subscribe({
        next: () => {
          console.log('Product deleted successfully');
          alert('Product deleted successfully!');
          this.loadAllProducts();
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error deleting product', error);
          alert('Failed to delete product. Please try again.');
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
    this.selectedProduct.set(null);
    this.resetFormFields();
  }

  resetFormFields(): void {
    this.newProduct = {
      productName: '',
      price: 0
    };
  }

  validateProduct(product: Product): boolean {
    if (!product.productName || product.productName.trim() === '') {
      alert('Product name is required!');
      return false;
    }
    if (product.price === null || product.price === undefined) {
      alert('Price is required!');
      return false;
    }
    if (product.price < 0) {
      alert('Price must be a positive number!');
      return false;
    }
    return true;
  }
}
