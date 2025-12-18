export interface Order {
  id?: number;
  orderName: string;
  price: number;
}

export interface OrderDto {
  orderName?: string;
  price?: number;
}