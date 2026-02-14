// API Configuration
// export const API_BASE_URL =  'https://softx-api.duckdns.org/api';
export const API_BASE_URL =  'http://localhost:8002/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  ME: '/users/me',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT: (id: string) => `/products/${id}`,
  PRODUCTS_BULK: '/products/bulk',
  PRODUCT_FIELD_OPTIONS: '/products/field-options',
  PRODUCT_BOM: (id: string, variant?: string) =>
    `/products/${id}/bom${variant ? `?variant=${variant}` : ''}`,
  
  // Raw Materials
  RAW_MATERIALS: '/raw-materials',
  RAW_MATERIAL: (id: string) => `/raw-materials/${id}`,
  ADJUST_STOCK: (id: string) => `/raw-materials/${id}/adjust-stock`,
  CHECK_STOCK: '/raw-materials/check-stock',
  FIELD_OPTIONS: '/raw-materials/field-options',

  // Inventory Logs
  INVENTORY_LOGS: (rawMaterialId: number) =>
    `/inventory-logs/raw-material/${rawMaterialId}`,
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_PRODUCTION_TREND: '/dashboard/production-trend',

  // Production (WIP)
  PRODUCTION_STAGE_INVENTORY: '/production/stage-inventory',
  PRODUCTION_COMPLETE_STAGE: '/production/complete-stage',
  PRODUCTION_MATERIALS_PREVIEW: '/production/materials-preview',

  // BOM
  BOM: '/bom',
  BOM_LINE: (id: string) => `/bom/${id}`,
  BOM_VARIANTS: '/bom/variants',
  BOM_PRODUCTION_CALC: '/bom/production-calc',

  // Job Rates
  JOB_RATES: '/job-rates',
  JOB_RATE: (id: string) => `/job-rates/${id}`,

  // Work Logs
  WORK_LOGS: '/work-logs',
  WORK_LOG: (id: string) => `/work-logs/${id}`,

  // Parties
  PARTIES: '/parties',
  PARTY: (id: string) => `/parties/${id}`,
  PARTIES_FIELD_OPTIONS: '/parties/field-options',
  
  // Users
  USERS: '/users',
  USER: (id: string) => `/users/${id}`,
  USERS_BY_ROLE: '/users/role',
};

// Query Keys for React Query
export const QUERY_KEYS = {
  // Auth
  CURRENT_USER: 'current-user',
  
  // Products
  PRODUCTS: 'products',
  PRODUCT: (id: string) => ['product', id],
  PRODUCT_FIELD_OPTIONS: (fields: string) => ['product-field-options', fields],
  PRODUCT_BOM: (id: string, variant?: string) => ['product-bom', id, variant],
  
  // Raw Materials
  RAW_MATERIALS: 'raw-materials',
  RAW_MATERIAL: (id: string) => ['raw-material', id],
  STOCK_CHECK: 'stock-check',
  FIELD_OPTIONS: (fields: string) => ['field-options', fields],
  INVENTORY_LOGS: (rawMaterialId: number) => ['inventory-logs', rawMaterialId],
  
  // Dashboard
  DASHBOARD_STATS: 'dashboard-stats',
  PRODUCTION_TREND: (days: number) => ['production-trend', days],

  // Production (WIP)
  STAGE_INVENTORY: 'stage-inventory',
  MATERIALS_PREVIEW: (productId: number, variant: string | undefined, stage: number, qty: number) =>
    ['materials-preview', productId, variant, stage, qty],

  // BOM
  BOM_LINES: 'bom-lines',
  BOM_LINE: (id: string) => ['bom-line', id],

  // Job Rates
  JOB_RATES: 'job-rates',
  JOB_RATE: (id: string) => ['job-rate', id],

  // Work Logs
  WORK_LOGS: 'work-logs',
  WORK_LOG: (id: string) => ['work-log', id],

  // Parties
  PARTIES: 'parties',
  PARTY: (id: string) => ['party', id],
  PARTIES_FIELD_OPTIONS: (fields: string) => ['parties-field-options', fields],
  
  // Users
  USERS: 'users',
  USER: (id: string) => ['user', id],
  USERS_BY_ROLE: (roles: string[]) => ['users-by-role', ...roles],
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  SUPERVISOR: 'Supervisor',
  STAFF: 'Staff',
  WORKER: 'Worker',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth-storage',
  THEME_MODE: 'theme-storage',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
