// Base Entity
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// Product
export interface Product extends BaseEntity {
  part_no: string;
  name: string;
  category?: string;
  group?: string;
  mrp?: number;
  qty?: number;
  gst?: number;
  hsn?: string;
  model_name?: string;
  product_image?: string;
  distributor_price?: number;
  dealer_price?: number;
  retail_price?: number;
  unit_of_measure?: string;
  is_active: boolean;
}

// Raw Material
export interface RawMaterial extends BaseEntity {
  name: string;
  unit_type?: string;
  material_type?: string;
  group?: string;
  min_stock_req?: number;
  min_order_qty?: number;
  stock_qty?: number;
  purchase_price?: number;
  gst?: number;
  hsn?: string;
  description?: string;
  treat_as_consume: boolean;
  is_active: boolean;
}

// BOM Line
export interface BOMLine extends BaseEntity {
  product_id: number;
  raw_material_id: number;
  raw_material_name?: string;
  variant?: string;
  batch_qty: number;
  raw_qty: number;
  product?: Product;
  raw_material?: RawMaterial;
}

// User
export interface User extends BaseEntity {
  username: string;
  name: string;
  role: 'Admin' | 'Supervisor' | 'Staff' | 'Worker';
  status: 'Active' | 'Inactive';
  phone?: string;
  job?: string;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// List Response
export interface ListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  page_size?: number;
}

// Login Credentials
export interface LoginCredentials {
  username: string;
  password: string;
}

// Login Response
export interface LoginResponse {
  user: User;
  token: {
    access_token: string;
    token_type: string;
  };
}

// Register Response  
export interface RegisterResponse {
  user: User;
  token: {
    access_token: string;
    token_type: string;
  };
}

// Query Params
export interface QueryParams {
  search?: string;
  page?: number;
  page_size?: number;
  [key: string]: unknown;
}
