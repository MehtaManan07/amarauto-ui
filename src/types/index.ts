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
  unit_type: string;
  material_type?: string;
  group?: string;
  min_stock_req?: number;
  min_order_qty?: number;
  stock_qty: number;
  purchase_price?: number;
  gst?: string;
  hsn?: string;
  description?: string;
  treat_as_consume: boolean;
  is_active: boolean;
}

// Inventory Log
export interface InventoryLog {
  id: number;
  raw_material_id: number;
  user_id?: number;
  type: 'add' | 'remove' | 'adjust';
  quantity_delta: number;
  previous_qty: number;
  new_qty: number;
  notes?: string;
  created_at: string;
}

// Bulk Upload for Raw Materials
export interface BulkUploadItemResult {
  name: string;
  success: boolean;
  error?: string;
  data?: RawMaterial;
}

export interface BulkUploadResponse {
  total: number;
  success_count: number;
  failure_count: number;
  results: BulkUploadItemResult[];
}

// BOM Line (from product detail response)
export interface BOMLineItem {
  raw_material_id?: number;
  raw_material_name?: string;
  variant?: string;
  batch_qty?: number;
  raw_qty?: number;
}

// Full BOM Line (from BOM API)
export interface BOMLine extends BaseEntity {
  product_id: number;
  raw_material_id: number;
  product_name?: string;
  product_part_no?: string;
  raw_material_name?: string;
  variant?: string;
  batch_qty: number;
  raw_qty: number;
  product?: Product;
  raw_material?: RawMaterial;
}

// Production Calculator
export interface ProductionCalcLine {
  raw_material_name: string;
  unit_type: string;
  needed_qty: number;
  current_stock: number;
  shortage: number;
  status: 'ok' | 'low';
  purchase_price?: number;
  order_cost: number;
}

export interface ProductionCalcResponse {
  product_part_no: string;
  product_name: string;
  variant?: string;
  quantity: number;
  lines: ProductionCalcLine[];
  total_order_cost: number;
  max_producible_units: number;
}

// Product with BOM (detail response)
export interface ProductDetail extends Product {
  bom_by_variant?: Record<string, BOMLineItem[]>;
}

// Job Rate (operation)
export interface JobRate extends BaseEntity {
  product_id: number;
  product_part_no?: string;
  operation_code: string;
  operation_name: string;
  rate: number;
  sequence: number;
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

// Paginated Response (mystock pattern)
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_more: boolean;
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
