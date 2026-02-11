# API Response Structures

This document documents the **ACTUAL** API response structures from the backend.

## Important: Response Wrapping

All successful API responses (status 2xx) are wrapped by the backend's `SuccessResponseInterceptor` in this format:

```json
{
  "success": true,
  "data": <actual response>,
  "count": 123  // Only present for array responses
}
```

However, the **axios interceptor** in `client/src/api/axios.ts` automatically unwraps this, so all API modules and hooks receive just the `data` portion.

**This means:**
- **List endpoints return arrays directly** (e.g., `Product[]`), not `{ items, total }`
- **Single item endpoints return the item directly** (e.g., `Product`)
- **IDs are numbers**, not strings

## Authentication

### POST /api/users/login
Returns nested structure with user and token:

```typescript
{
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
    phone: string;
    job: string;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  token: {
    access_token: string;
    token_type: string;
  };
}
```

### POST /api/users/register
Same structure as login.

### GET /api/users/me
Returns single User object.

## Users

### GET /api/users
Returns `User[]` (array of users).

### GET /api/users/:id
Returns `User` (single user).

### PATCH /api/users/:id
Returns `User` (updated user).

## Products

### GET /api/products
Returns `Product[]` (array of products).

```typescript
{
  id: number;
  name: string;
  category: string | null;
  part_no: string;
  model_name: string | null;
  group_name: string | null;
  unit_of_measure: string;
  price_per_unit: number | null;
  variant: string | null;
  batch_size: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
```

### GET /api/products/:id
Returns `Product` (single product).

### GET /api/products/:id/bom
Returns `BOMLine[]` (array of BOM lines for that product).

## Raw Materials

### GET /api/raw-materials
Returns `RawMaterial[]` (array of raw materials).

```typescript
{
  id: number;
  name: string;
  part_no: string;
  category: string;
  stock_quantity: number;
  purchase_price: number | null;
  min_stock_level: number | null;
  unit_of_measure: string;
  color: string | null;
  size: string | null;
  finish: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
```

### GET /api/raw-materials/stock/check
Returns `RawMaterial[]` (array, optionally filtered to those below min stock).

### GET /api/raw-materials/field-options?fields=category,color
Returns object with field names as keys:

```typescript
{
  "category": ["Hardware", "Wood", "Fabric"],
  "color": ["Red", "Blue", "Green"]
}
```

## BOM

### GET /api/bom
Returns `BOMLine[]` (array of BOM lines).

```typescript
{
  id: number;
  product_id: number;
  raw_material_id: number;
  raw_material_name: string | null;
  variant: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
```

### GET /api/bom/:id
Returns `BOMLine` (single BOM line).

## Summary

✅ **All list endpoints return arrays directly**, not `{ items, total }`  
✅ **All IDs are numbers**, not strings  
✅ The axios interceptor automatically unwraps `{ success, data, count }`  
✅ Login/Register return nested `{ user, token }` structure  
✅ Most other endpoints return either an array or single object
