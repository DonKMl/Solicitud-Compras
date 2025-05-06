export interface Product {
  name: string;
  quantity: string;
  specification?: string;
}

export interface PurchaseRequest {
  name: string;
  position: string;
  department: string;
  site: string;
  requestType: string;
  justification: string;
  products: Product[];
}
