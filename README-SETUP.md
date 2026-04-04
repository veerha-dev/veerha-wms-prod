# Veerha WMS - Complete Setup Guide

## ✅ Warehouse Module Status: COMPLETE

All backend files created and verified:
- NestJS backend with pg driver (no ORM)
- Warehouse CRUD module with raw SQL
- Database migrations ready
- Frontend API client configured

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Database

**Option A: Docker PostgreSQL (Recommended - Easiest)**
```bash
# Start PostgreSQL container
docker compose up -d

# Verify it's running
docker ps
```

**Option B: Use Neon (Cloud)**
1. Go to https://neon.tech
2. Create free account
3. Create database
4. Copy connection string
5. Update `apps/backend/.env` with your Neon URL

**Option C: Local PostgreSQL**
```bash
# Create database manually
psql postgres -c "CREATE DATABASE veerha_wms_dev;"

# Update apps/backend/.env with your credentials
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/veerha_wms_dev
```

---

### Step 2: Run Database Migrations

```bash
cd apps/backend
npm run migrate
```

Expected output:
```
🔄 Running database migrations...
✅ Executed: 001_create_tenants.sql
✅ Executed: 002_create_warehouses.sql
✨ Executed 2 migration(s)
```

---

### Step 3: Start Backend & Frontend

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run start:dev
```

Expected output:
```
✅ Database connected successfully
🚀 Backend running on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend

# For mock data (default)
npm run dev

# For real backend
VITE_API_MODE=real npm run dev
```

Frontend will run on: http://localhost:8082

---

## 🧪 Testing Warehouse Module

### Using Mock Data (Default)
1. Open http://localhost:8082
2. Navigate to Warehouses
3. Create/Edit/Delete warehouses (data in localStorage)

### Using Real Backend
1. Set `VITE_API_MODE=real` in `apps/frontend/.env`
2. Restart frontend
3. Navigate to Warehouses
4. Create/Edit/Delete warehouses (data in PostgreSQL)

### API Testing (Postman/cURL)

**Create Warehouse:**
```bash
curl -X POST http://localhost:3000/api/v1/warehouses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Warehouse",
    "addressLine1": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "totalCapacity": 10000
  }'
```

**List Warehouses:**
```bash
curl http://localhost:3000/api/v1/warehouses
```

**Get Single Warehouse:**
```bash
curl http://localhost:3000/api/v1/warehouses/{id}
```

---

## 📁 Project Structure

```
veerha-wms-main/
├── apps/
│   ├── backend/          ✅ NestJS + PostgreSQL
│   │   ├── src/
│   │   │   ├── modules/warehouses/  ✅ Complete
│   │   │   ├── database/
│   │   │   │   └── migrations/      ✅ 2 migrations
│   │   │   └── main.ts
│   │   ├── .env                     ⚙️ Configure this
│   │   └── package.json
│   └── frontend/         ✅ React + Vite
│       ├── .env                     ⚙️ Optional: set VITE_API_MODE
│       └── package.json
├── packages/
│   └── shared-types/     ✅ Updated
├── docker-compose.yml    ✅ PostgreSQL setup
└── docs/                 ✅ Updated
```

---

## 🔧 Configuration Files

### `apps/backend/.env`
```env
DATABASE_URL=postgresql://veerha:veerha123@localhost:5432/veerha_wms_dev
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8082
```

### `apps/frontend/.env` (Optional)
```env
# Use mock data (default)
VITE_API_MODE=mock

# Use real backend
VITE_API_MODE=real
VITE_API_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### Database connection fails
```bash
# Check if PostgreSQL is running
docker ps  # For Docker
pg_isready # For local PostgreSQL

# Check connection string in apps/backend/.env
```

### Migrations fail
```bash
# Verify database exists
psql $DATABASE_URL -c "SELECT version();"

# Check migration files exist
ls apps/backend/src/database/migrations/
```

### Backend won't start
```bash
# Check dependencies installed
cd apps/backend && npm install

# Check TypeScript compiles
npm run build
```

### Frontend can't connect to backend
```bash
# Verify backend is running on port 3000
curl http://localhost:3000/api/v1/warehouses

# Check CORS_ORIGIN in backend .env matches frontend URL
```

---

## 📊 Database Schema

### Tables Created
1. **tenants** - Multi-tenancy support (default tenant included)
2. **warehouses** - 17 columns with full address, contact, capacity

### Warehouse Fields
- `code` - Auto-generated (WH-001, WH-002, ...)
- `name`, `type`, `status`
- `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`
- `total_capacity`, `total_area_sqft`, `current_occupancy`
- `contact_phone`, `contact_email`

---

## 🎯 Next Steps

After warehouse module is working:
1. Implement Zones module (depends on warehouses)
2. Implement Racks module (depends on zones)
3. Implement Bins module (depends on racks)
4. Add authentication (JWT)
5. Implement remaining modules

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/warehouses` | List all (pagination, search, filters) |
| GET | `/api/v1/warehouses/:id` | Get single warehouse |
| POST | `/api/v1/warehouses` | Create warehouse |
| PUT | `/api/v1/warehouses/:id` | Update warehouse |
| DELETE | `/api/v1/warehouses/:id` | Delete warehouse |

---

## ✨ What's Working

- ✅ Backend compiles without errors
- ✅ Frontend builds successfully
- ✅ Database migrations ready
- ✅ All CRUD operations implemented
- ✅ Validation on all DTOs
- ✅ Auto-code generation (WH-001, WH-002...)
- ✅ Pagination, search, filters
- ✅ Standard API response envelope
- ✅ CORS configured
- ✅ Development logging

---

## 💡 Tips

1. **Use Docker PostgreSQL** - Easiest setup, no password issues
2. **Start with mock data** - Test frontend without backend
3. **Check logs** - Backend shows all SQL queries in dev mode
4. **Use Postman** - Test APIs before frontend integration
5. **Read error messages** - They're descriptive and helpful
