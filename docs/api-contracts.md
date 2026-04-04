# Veerha WMS — API Contracts

## 1. General Conventions

| Property         | Value                          |
|------------------|--------------------------------|
| Base path        | `/api/v1`                      |
| Protocol         | HTTPS                          |
| Content type     | `application/json`             |
| Authentication   | JWT Bearer token               |
| Date format      | ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`) |

### Response Envelope

All API responses use this format:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  }
}
```

### Pagination

List endpoints accept:

| Param  | Type    | Default | Description       |
|--------|---------|---------|-------------------|
| page   | integer | 1       | Page number       |
| limit  | integer | 50      | Items per page    |
| sort   | string  | —       | Sort field        |
| order  | string  | asc     | `asc` or `desc`   |

Paginated responses include:

```json
{
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

---

## 2. Authentication

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| POST   | `/auth/login`    | Login with email/password |
| POST   | `/auth/signup`   | Register new tenant + admin |
| POST   | `/auth/refresh`  | Refresh access token |
| POST   | `/auth/logout`   | Invalidate session   |
| GET    | `/auth/me`       | Get current user     |

### POST `/auth/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt...",
    "refreshToken": "jwt...",
    "user": { "id": "...", "email": "...", "name": "...", "role": "admin" }
  }
}
```

---

## 3. Tenant

| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| GET    | `/tenant`          | Get current tenant   |
| GET    | `/tenants/current` | Alias                |

---

## 4. Modules

| Method | Endpoint    | Description            |
|--------|-------------|------------------------|
| GET    | `/modules`  | List enabled modules   |

---

## 5. Dashboard

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/dashboard/stats`    | Dashboard KPIs           |
| GET    | `/dashboard/inventory`| Inventory overview       |
| GET    | `/dashboard/orders`   | Orders summary           |
| GET    | `/dashboard/realtime` | Realtime metrics         |
| GET    | `/dashboard/trend`    | Trend data               |

---

## 6. Warehouses

| Method | Endpoint           | Description            |
|--------|--------------------|------------------------|
| GET    | `/warehouses`      | List warehouses        |
| POST   | `/warehouses`      | Create warehouse       |
| PUT    | `/warehouses/:id`  | Update warehouse       |
| DELETE | `/warehouses/:id`  | Delete warehouse       |

---

## 7. Layout (Zones, Racks, Bins)

| Method | Endpoint       | Description     |
|--------|----------------|-----------------|
| GET    | `/zones`       | List zones      |
| POST   | `/zones`       | Create zone     |
| GET    | `/racks`       | List racks      |
| POST   | `/racks`       | Create rack     |
| GET    | `/bins`        | List bins       |
| POST   | `/bins`        | Create bin      |

All support `?warehouseId=` and `?zoneId=` filters.

---

## 8. Inventory

| Method | Endpoint                 | Description            |
|--------|--------------------------|------------------------|
| GET    | `/skus`                  | List SKUs              |
| POST   | `/skus`                  | Create SKU             |
| PUT    | `/skus/:id`              | Update SKU             |
| DELETE | `/skus/:id`              | Delete SKU             |
| GET    | `/stock-levels`          | List stock levels      |
| POST   | `/stock-levels`          | Create stock entry     |
| PUT    | `/stock-levels/:id`      | Update stock entry     |
| GET    | `/batches`               | List batches           |
| POST   | `/batches`               | Create batch           |
| PUT    | `/batches/:id`           | Update batch           |
| GET    | `/movements`             | List movements         |
| POST   | `/movements`             | Record movement        |

---

## 9. Inbound

### Suppliers

| Method | Endpoint           | Description       |
|--------|--------------------|-------------------|
| GET    | `/suppliers`       | List suppliers    |
| POST   | `/suppliers`       | Create supplier   |

### Purchase Orders

| Method | Endpoint                        | Description        |
|--------|---------------------------------|--------------------|
| GET    | `/purchase-orders`              | List POs           |
| POST   | `/purchase-orders`              | Create PO          |
| PUT    | `/purchase-orders/:id`          | Update PO          |
| POST   | `/purchase-orders/:id/submit`   | Submit PO          |
| POST   | `/purchase-orders/:id/approve`  | Approve PO         |
| POST   | `/purchase-orders/:id/cancel`   | Cancel PO          |
| GET    | `/purchase-orders/stats`        | PO statistics      |

### GRN

| Method | Endpoint                      | Description          |
|--------|-------------------------------|----------------------|
| GET    | `/grn`                        | List GRNs            |
| POST   | `/grn`                        | Create GRN           |
| GET    | `/grn/:id`                    | Get GRN detail       |
| PUT    | `/grn/:id/items/:itemId`      | Update GRN item      |
| POST   | `/grn/:id/complete`           | Complete GRN         |

### QC Inspections

| Method | Endpoint                      | Description          |
|--------|-------------------------------|----------------------|
| GET    | `/qc`                         | List inspections     |
| GET    | `/qc/:id`                     | Get inspection       |
| POST   | `/qc/:id/start`               | Start inspection     |
| POST   | `/qc/:id/complete`            | Complete inspection  |
| POST   | `/qc/:id/defects`             | Add defect           |

---

## 10. Outbound

### Sales Orders

| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | `/sales-orders`                 | List orders          |
| POST   | `/sales-orders`                 | Create order         |
| POST   | `/sales-orders/:id/confirm`     | Confirm order        |
| POST   | `/sales-orders/:id/cancel`      | Cancel order         |
| GET    | `/sales-orders/stats`           | Order statistics     |

### Pick Lists

| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | `/pick-lists`                   | List pick lists      |
| POST   | `/pick-lists`                   | Create pick list     |
| POST   | `/pick-lists/:id/assign`        | Assign picker        |
| POST   | `/pick-lists/:id/complete`      | Complete picking     |

### Shipments

| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | `/shipments`                    | List shipments       |
| POST   | `/shipments`                    | Create shipment      |
| POST   | `/shipments/:id/dispatch`       | Dispatch shipment    |
| POST   | `/shipments/:id/deliver`        | Mark delivered       |

### Returns

| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | `/returns`                      | List returns         |
| POST   | `/returns`                      | Create return        |
| POST   | `/returns/:id/receive`          | Receive return       |
| POST   | `/returns/:id/process`          | Process return       |

---

## 11. Operations

### Tasks

| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| GET    | `/tasks`                        | List tasks           |
| POST   | `/tasks`                        | Create task          |
| PUT    | `/tasks/:id`                    | Update task          |
| POST   | `/tasks/:id/assign`             | Assign task          |
| POST   | `/tasks/:id/complete`           | Complete task        |

### Adjustments

| Method | Endpoint                           | Description          |
|--------|------------------------------------|----------------------|
| GET    | `/adjustments`                     | List adjustments     |
| POST   | `/adjustments`                     | Create adjustment    |
| POST   | `/adjustments/:id/approve`         | Approve adjustment   |
| POST   | `/adjustments/:id/reject`          | Reject adjustment    |

### Damaged Items

| Method | Endpoint                           | Description          |
|--------|------------------------------------|----------------------|
| GET    | `/damaged-items`                   | List damaged items   |
| POST   | `/damaged-items`                   | Report damage        |
| PUT    | `/damaged-items/:id`               | Update record        |
| POST   | `/damaged-items/:id/dispose`       | Dispose item         |

### Alerts

| Method | Endpoint                           | Description          |
|--------|------------------------------------|----------------------|
| GET    | `/alerts`                          | List alerts          |
| GET    | `/alerts/summary`                  | Alert summary        |
| POST   | `/alerts/:id/acknowledge`          | Acknowledge alert    |
| POST   | `/alerts/acknowledge-all`          | Acknowledge all      |

---

## 12. Reports

| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| GET    | `/reports/stock`           | Stock report             |
| GET    | `/reports/movements`       | Movement report          |
| GET    | `/reports/purchase`        | Purchase register        |
| GET    | `/reports/sales`           | Sales register           |
| GET    | `/reports/expiry`          | Expiry report            |
| GET    | `/reports/low-stock`       | Low stock report         |
| GET    | `/reports/utilization`     | Warehouse utilization    |
| GET    | `/reports/audit`           | Audit trail              |

All reports support `?startDate=`, `?endDate=`, `?warehouseId=` filters.

---

## 13. Users

| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| GET    | `/users`                | List users           |
| POST   | `/users`                | Create/invite user   |
| PUT    | `/users/:id`            | Update user          |
| POST   | `/users/:id/disable`    | Disable user         |
| POST   | `/users/:id/activate`   | Activate user        |
