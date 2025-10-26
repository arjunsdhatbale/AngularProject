export interface Product {
  id?: number;
  productName: string;
  price: number;
}

export interface ProductDto {
  productName?: string;
  price?: number;
}