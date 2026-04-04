# Prod Testing Account — Reference Data

## Account Credentials

| Dashboard | URL | Email | Password |
|-----------|-----|-------|----------|
| **WMS Admin** | http://localhost:8080 | prodtesting@gmail.com | prod123 |
| **Super Admin** | http://localhost:8090 | superadmin@veerha.com | superadmin123 |
| **API Docs (Swagger)** | http://localhost:3000/api/docs | — | Use JWT from login |
| **API Docs (ReDoc)** | http://localhost:3000/api/redoc | — | Read-only |

**Tenant ID:** `fb9b6007-c3a9-4ba1-8ca6-6c2eb983a013`
**Admin User ID:** (auto-generated on tenant creation)
**Plan:** Enterprise

---

## Summary Totals

| Entity | Count |
|--------|-------|
| Warehouses | 3 |
| Zones | 10 |
| Aisles | 16 |
| Racks | 43 |
| Bins | 886 |

---

## Warehouses (3)

| Code | Name | Type | City | State | Postal | Capacity | Area (sqft) | Phone | Email | ID |
|------|------|------|------|-------|--------|----------|-------------|-------|-------|----|
| WH-001 | Veerha Main Distribution Center | distribution | Chennai | Tamil Nadu | 600058 | 50,000 | 25,000 | +91-9876543210 | warehouse1@prodtesting.com | `e193c35e-323e-4e39-91d2-5938033d55ea` |
| WH-002 | Pharma Cold Storage Unit | cold_storage | Bengaluru | Karnataka | 560099 | 20,000 | 12,000 | +91-9988776655 | coldstorage@prodtesting.com | `f71a9613-4d65-4439-8aa5-fe2a513b529d` |
| WH-003 | Mumbai Manufacturing Hub | manufacturing | Mumbai | Maharashtra | 400093 | 35,000 | 18,000 | +91-9112233445 | manufacturing@prodtesting.com | `123aeb66-9784-4ebd-8faf-15b377ac9657` |

---

## WH-001 — Chennai (4 zones, 7 aisles, 19 racks, 240 bins)

### Zones

| Code | Name | Type | Aisles | Racks | Bins | ID |
|------|------|------|--------|-------|------|----|
| ZN-005 | General Storage | storage | 2 | 4 | 24 | `07ee2b64-eff0-4643-a4a1-3a4a4d26c435` |
| ZN-013 | Fast Moving Zone | fast-moving | 2 | 5 | 60 | `410a9d80-95b2-4881-ae48-acb0379d3815` |
| ZN-014 | Receiving Dock - Expanded | receiving | 1 | 4 | 60 | `df9d5c72-6a68-49dd-83c5-ce8b1749a5b6` |
| ZN-015 | Dispatch Bay - Full | shipping | 2 | 6 | 96 | `51f89a30-5f5b-4cf5-ba07-1d1111753839` |

### Aisles (WH-001)

| Code | Name | Zone | Racks | ID |
|------|------|------|-------|----|
| AL-001 | Aisle Alpha | ZN-005 | 2 | `6397e506-f3af-41df-80c4-814841e48ee6` |
| AL-002 | Aisle Beta | ZN-005 | 2 | `43cc3e6e-8a85-463f-a82b-d46ae48e72b3` |
| FA-01 | Fast Aisle 1 | ZN-013 | 3 | `39adcbfe-efa3-4d03-a193-8609738dba4d` |
| FA-02 | Fast Aisle 2 | ZN-013 | 2 | `4fe9b462-cf59-4a1a-9768-8c61f88de849` |
| IA-01 | Inbound Aisle 1 | ZN-014 | 4 | `3c99ad7a-155b-4ae8-ab09-1fabab37769e` |
| OA-01 | Outbound Aisle 1 | ZN-015 | 3 | `d34e8e60-699f-4f7b-983c-7da49980725f` |
| OA-02 | Outbound Aisle 2 | ZN-015 | 3 | `3fb5984d-b2f5-41d6-9071-ad2843f7c7c5` |

### Racks (WH-001)

| Code | Name | Zone | Aisle | Levels | Slots/Level | Bins | ID |
|------|------|------|-------|--------|-------------|------|----|
| RK-006 | Rack A1-R1 | ZN-005 | AL-001 | 4 | 6 | 24 | `6c30929e-8d5d-4487-ab73-56484eaf1a19` |
| RK-007 | Rack A1-R2 | ZN-005 | AL-001 | 4 | 6 | 0 | `94f8efbe-2349-49a7-b000-2ecf7237dea5` |
| RK-008 | Rack A2-R1 | ZN-005 | AL-002 | 5 | 4 | 0 | `0f922606-fc75-4b18-8d73-813f5492d68b` |
| RK-009 | Rack A2-R2 | ZN-005 | AL-002 | 5 | 4 | 0 | `3e9cdf1b-c068-4df7-88bb-7e2d7212b235` |
| FR-01 | FR-01 | ZN-013 | FA-01 | 3 | 4 | 12 | `1f01a6f3-1ec7-491b-a387-c5aa854d7b30` |
| FR-02 | FR-02 | ZN-013 | FA-01 | 3 | 4 | 12 | `ef8b1cb0-11de-4340-a1f1-97371d29eb70` |
| FR-03 | FR-03 | ZN-013 | FA-01 | 3 | 4 | 12 | `cc2405c8-aa80-45c1-8816-a39f0834b18e` |
| FR-04 | FR-04 | ZN-013 | FA-02 | 3 | 4 | 12 | `ba5c91b8-a20d-4c81-b5da-2a69f9c0a695` |
| FR-05 | FR-05 | ZN-013 | FA-02 | 3 | 4 | 12 | `79d5c6be-a569-4951-8b8f-53f65445eeb5` |
| RCV-R01 | RCV-R01 | ZN-014 | IA-01 | 5 | 3 | 15 | `4b88fca2-124b-4892-abf0-d83fb23fa6e1` |
| RCV-R02 | RCV-R02 | ZN-014 | IA-01 | 5 | 3 | 15 | `80081237-8e74-456a-9718-2d0584eebd69` |
| RCV-R03 | RCV-R03 | ZN-014 | IA-01 | 5 | 3 | 15 | `3d02c551-cffe-4961-a582-c597c77f5bc5` |
| RCV-R04 | RCV-R04 | ZN-014 | IA-01 | 5 | 3 | 15 | `b202ad9c-51b6-4158-9338-9310d83dbb7a` |
| DSP-R01 | DSP-R01 | ZN-015 | OA-01 | 4 | 4 | 16 | `feac3d2f-4418-43e1-af90-709e659d563c` |
| DSP-R02 | DSP-R02 | ZN-015 | OA-01 | 4 | 4 | 16 | `7d307879-d07e-4332-b4ce-b6da3b0e8cc8` |
| DSP-R03 | DSP-R03 | ZN-015 | OA-01 | 4 | 4 | 16 | `3c266098-2d89-41c0-b040-4cb1d11c27da` |
| DSP-R04 | DSP-R04 | ZN-015 | OA-02 | 4 | 4 | 16 | `263c58b1-923b-4fed-80c1-4cb073a1f418` |
| DSP-R05 | DSP-R05 | ZN-015 | OA-02 | 4 | 4 | 16 | `d41d5f7c-0f48-4a3c-b4b3-10789bcecb73` |
| DSP-R06 | DSP-R06 | ZN-015 | OA-02 | 4 | 4 | 16 | `7afb42de-70f2-4642-a735-3dab0e9f7753` |

---

## WH-002 — Bengaluru (3 zones, 4 aisles, 9 racks, 214 bins)

### Zones

| Code | Name | Type | Aisles | Racks | Bins | ID |
|------|------|------|--------|-------|------|----|
| ZN-007 | Pharma Storage | storage | 2 | 4 | 88 | `77a61bff-7457-4b0b-95f9-086d70499e74` |
| ZN-016 | Cold Storage - Expanded | cold-storage | 1 | 3 | 90 | `b5e4bd2e-8449-4adc-88ed-ca52aa1000c9` |
| ZN-017 | QC Staging - Full | staging | 1 | 2 | 36 | `2f0c9987-6f16-4785-a6bb-ba8450900484` |

### Aisles (WH-002)

| Code | Name | Zone | Racks | ID |
|------|------|------|-------|----|
| AL-003 | Aisle Gamma | ZN-007 | 2 | `3c59a418-1a3a-4cf4-8180-2b272e7f7b2a` |
| AL-004 | Aisle Delta | ZN-007 | 2 | `d70c9f87-0408-4e32-bcc1-7c95abd472d6` |
| CA-01 | Cold Aisle 1 | ZN-016 | 3 | `6682ebd2-32c0-4003-98f1-238da5a1e2ef` |
| QA-01 | QC Aisle 1 | ZN-017 | 2 | `c4216ffe-cf6f-40e4-89a5-82ae8c3bed24` |

### Racks (WH-002)

| Code | Name | Zone | Aisle | Levels | Slots/Level | Bins | ID |
|------|------|------|-------|--------|-------------|------|----|
| RK-010 | Rack A3-R1 | ZN-007 | AL-003 | 3 | 8 | 24 | `5efd6fdc-4a35-40a3-a0b1-7ec44967e603` |
| RK-011 | Rack A3-R2 | ZN-007 | AL-003 | 3 | 8 | 24 | `73c93922-df12-4a0d-a244-909ca1e6e833` |
| RK-012 | Rack A4-R1 | ZN-007 | AL-004 | 4 | 5 | 20 | `df3b2689-f712-4817-a584-a3750494e59a` |
| RK-013 | Rack A4-R2 | ZN-007 | AL-004 | 4 | 5 | 20 | `d3bcd147-0df4-4576-993c-a15247095823` |
| CLD-R01 | CLD-R01 | ZN-016 | CA-01 | 6 | 5 | 30 | `ce599a49-ff5d-43f1-b40e-ea2ac6a815e3` |
| CLD-R02 | CLD-R02 | ZN-016 | CA-01 | 6 | 5 | 30 | `1ec18c0b-beda-47b5-850f-7b1fc848aa07` |
| CLD-R03 | CLD-R03 | ZN-016 | CA-01 | 6 | 5 | 30 | `a48724ab-a59f-4075-b05c-543dcc4b3006` |
| QC-R01 | QC-R01 | ZN-017 | QA-01 | 3 | 6 | 18 | `110dc407-cc2f-43ba-a8c5-2866ac56ff51` |
| QC-R02 | QC-R02 | ZN-017 | QA-01 | 3 | 6 | 18 | `0513f4f0-8ea1-4925-b410-207faaf39060` |

---

## WH-003 — Mumbai (3 zones, 5 aisles, 15 racks, 432 bins)

### Zones

| Code | Name | Type | Aisles | Racks | Bins | ID |
|------|------|------|--------|-------|------|----|
| ZN-010 | Finished Goods | storage | 2 | 4 | 96 | `d550d1f9-2614-4cba-956b-060a5efe0736` |
| ZN-018 | Raw Material Store - Full | bulk | 2 | 8 | 240 | `8de4663e-2673-4c41-88c9-366fff289a84` |
| ZN-019 | Packing Station - Full | packing | 1 | 3 | 96 | `edeed9a9-142c-4a72-b88b-fd18d2025c98` |

### Aisles (WH-003)

| Code | Name | Zone | Racks | ID |
|------|------|------|-------|----|
| AL-005 | Aisle Epsilon | ZN-010 | 2 | `a803f825-7f00-413e-a6f7-ac7fa5c7fba2` |
| AL-006 | Aisle Zeta | ZN-010 | 2 | `feaac01e-eb95-4ee9-8527-e536567cb813` |
| MA-A | Material Aisle A | ZN-018 | 4 | `78e77a07-9303-439a-ab0e-f4fc424cae85` |
| MA-B | Material Aisle B | ZN-018 | 4 | `e41de692-402b-4674-b1b3-870bf97eae2a` |
| PA-01 | Pack Aisle 1 | ZN-019 | 3 | `e3af04f8-15e3-44b4-8bc4-d58195da4d70` |

### Racks (WH-003)

| Code | Name | Zone | Aisle | Levels | Slots/Level | Bins | ID |
|------|------|------|-------|--------|-------------|------|----|
| RK-014 | Rack A5-R1 | ZN-010 | AL-005 | 6 | 4 | 24 | `0f81f90e-a98c-4ac8-b343-660fdc4baa73` |
| RK-015 | Rack A5-R2 | ZN-010 | AL-005 | 6 | 4 | 24 | `5018b307-b042-4ef1-a94e-6694ba10e07f` |
| RK-016 | Rack A6-R1 | ZN-010 | AL-006 | 4 | 6 | 24 | `5e890352-7fe7-438d-8cae-0b1332082cf2` |
| RK-017 | Rack A6-R2 | ZN-010 | AL-006 | 4 | 6 | 24 | `5bf5c469-7b41-4437-9895-099a0aaab551` |
| RM-A01 | RM-A01 | ZN-018 | MA-A | 5 | 6 | 30 | `33441d95-e6ec-4006-972e-cd62e74634c8` |
| RM-A02 | RM-A02 | ZN-018 | MA-A | 5 | 6 | 30 | `655a5b0d-ed8c-4f69-8abe-49412f3092ff` |
| RM-A03 | RM-A03 | ZN-018 | MA-A | 5 | 6 | 30 | `91dcafd8-8a14-4ff8-9d15-4fd1fa86dfed` |
| RM-A04 | RM-A04 | ZN-018 | MA-A | 5 | 6 | 30 | `2372a088-972d-419a-a229-f1147a2fe55f` |
| RM-B01 | RM-B01 | ZN-018 | MA-B | 5 | 6 | 30 | `513f7792-204c-48c7-8ab5-581f83730e2f` |
| RM-B02 | RM-B02 | ZN-018 | MA-B | 5 | 6 | 30 | `2c0c1f9a-3c21-49e1-8e13-10a023f4c210` |
| RM-B03 | RM-B03 | ZN-018 | MA-B | 5 | 6 | 30 | `d57de1d7-be78-4cb7-b309-3d72af8afa7d` |
| RM-B04 | RM-B04 | ZN-018 | MA-B | 5 | 6 | 30 | `b348adf5-be9e-4afd-9049-357cb3bc3a74` |
| PK-R01 | PK-R01 | ZN-019 | PA-01 | 4 | 8 | 32 | `c7eff37f-84c6-457b-b2a0-4713f602a099` |
| PK-R02 | PK-R02 | ZN-019 | PA-01 | 4 | 8 | 32 | `81456792-7e19-4492-9fa0-0e77cec706f5` |
| PK-R03 | PK-R03 | ZN-019 | PA-01 | 4 | 8 | 32 | `fe72337c-47c3-4dd7-9b56-d475bdc4bfc3` |

---

## Bins Summary (886 total)

Bins are auto-generated per rack based on levels x slots/level. Bin codes follow two patterns:
- **Bulk-created bins:** `{RACK_CODE}-L{level}P{position}` (e.g., `FR-01-L1P1`, `DSP-R01-L2P3`)
- **Manually-created bins:** `BIN-{sequential}` (e.g., `BIN-039`, `BIN-062`)

| Warehouse | Zone | Bins | Bin Code Pattern |
|-----------|------|------|------------------|
| WH-001 Chennai | ZN-005 General Storage | 24 | BIN-039 to BIN-062 |
| WH-001 Chennai | ZN-013 Fast Moving | 60 | FR-01-L1P1 to FR-05-L3P4 |
| WH-001 Chennai | ZN-014 Receiving Dock | 60 | RCV-R01-L1P1 to RCV-R04-L5P3 |
| WH-001 Chennai | ZN-015 Dispatch Bay | 96 | DSP-R01-L1P1 to DSP-R06-L4P4 |
| WH-002 Bengaluru | ZN-007 Pharma Storage | 88 | BIN-741 to BIN-828 |
| WH-002 Bengaluru | ZN-016 Cold Storage | 90 | CLD-R01-L1P1 to CLD-R03-L6P5 |
| WH-002 Bengaluru | ZN-017 QC Staging | 36 | QC-R01-L1P1 to QC-R02-L3P6 |
| WH-003 Mumbai | ZN-010 Finished Goods | 96 | BIN-829 to BIN-924 |
| WH-003 Mumbai | ZN-018 Raw Material | 240 | RM-A01-L1P1 to RM-B04-L5P6 |
| WH-003 Mumbai | ZN-019 Packing Station | 96 | PK-R01-L1P1 to PK-R03-L4P8 |

---

## Hierarchy Visualization

```
Prod Testing Tenant (fb9b6007)
├── WH-001 Chennai (e193c35e) — 240 bins
│   ├── ZN-005 General Storage
│   │   ├── AL-001 Aisle Alpha
│   │   │   ├── RK-006 Rack A1-R1 (4L×6S = 24 bins)
│   │   │   └── RK-007 Rack A1-R2 (4L×6S = 0 bins)
│   │   └── AL-002 Aisle Beta
│   │       ├── RK-008 Rack A2-R1 (5L×4S = 0 bins)
│   │       └── RK-009 Rack A2-R2 (5L×4S = 0 bins)
│   ├── ZN-013 Fast Moving Zone
│   │   ├── FA-01 Fast Aisle 1
│   │   │   ├── FR-01 (3L×4S = 12 bins)
│   │   │   ├── FR-02 (3L×4S = 12 bins)
│   │   │   └── FR-03 (3L×4S = 12 bins)
│   │   └── FA-02 Fast Aisle 2
│   │       ├── FR-04 (3L×4S = 12 bins)
│   │       └── FR-05 (3L×4S = 12 bins)
│   ├── ZN-014 Receiving Dock
│   │   └── IA-01 Inbound Aisle 1
│   │       ├── RCV-R01 (5L×3S = 15 bins)
│   │       ├── RCV-R02 (5L×3S = 15 bins)
│   │       ├── RCV-R03 (5L×3S = 15 bins)
│   │       └── RCV-R04 (5L×3S = 15 bins)
│   └── ZN-015 Dispatch Bay
│       ├── OA-01 Outbound Aisle 1
│       │   ├── DSP-R01 (4L×4S = 16 bins)
│       │   ├── DSP-R02 (4L×4S = 16 bins)
│       │   └── DSP-R03 (4L×4S = 16 bins)
│       └── OA-02 Outbound Aisle 2
│           ├── DSP-R04 (4L×4S = 16 bins)
│           ├── DSP-R05 (4L×4S = 16 bins)
│           └── DSP-R06 (4L×4S = 16 bins)
│
├── WH-002 Bengaluru (f71a9613) — 214 bins
│   ├── ZN-007 Pharma Storage
│   │   ├── AL-003 Aisle Gamma
│   │   │   ├── RK-010 Rack A3-R1 (3L×8S = 24 bins)
│   │   │   └── RK-011 Rack A3-R2 (3L×8S = 24 bins)
│   │   └── AL-004 Aisle Delta
│   │       ├── RK-012 Rack A4-R1 (4L×5S = 20 bins)
│   │       └── RK-013 Rack A4-R2 (4L×5S = 20 bins)
│   ├── ZN-016 Cold Storage
│   │   └── CA-01 Cold Aisle 1
│   │       ├── CLD-R01 (6L×5S = 30 bins)
│   │       ├── CLD-R02 (6L×5S = 30 bins)
│   │       └── CLD-R03 (6L×5S = 30 bins)
│   └── ZN-017 QC Staging
│       └── QA-01 QC Aisle 1
│           ├── QC-R01 (3L×6S = 18 bins)
│           └── QC-R02 (3L×6S = 18 bins)
│
└── WH-003 Mumbai (123aeb66) — 432 bins
    ├── ZN-010 Finished Goods
    │   ├── AL-005 Aisle Epsilon
    │   │   ├── RK-014 Rack A5-R1 (6L×4S = 24 bins)
    │   │   └── RK-015 Rack A5-R2 (6L×4S = 24 bins)
    │   └── AL-006 Aisle Zeta
    │       ├── RK-016 Rack A6-R1 (4L×6S = 24 bins)
    │       └── RK-017 Rack A6-R2 (4L×6S = 24 bins)
    ├── ZN-018 Raw Material Store (LARGEST: 240 bins)
    │   ├── MA-A Material Aisle A
    │   │   ├── RM-A01 (5L×6S = 30 bins)
    │   │   ├── RM-A02 (5L×6S = 30 bins)
    │   │   ├── RM-A03 (5L×6S = 30 bins)
    │   │   └── RM-A04 (5L×6S = 30 bins)
    │   └── MA-B Material Aisle B
    │       ├── RM-B01 (5L×6S = 30 bins)
    │       ├── RM-B02 (5L×6S = 30 bins)
    │       ├── RM-B03 (5L×6S = 30 bins)
    │       └── RM-B04 (5L×6S = 30 bins)
    └── ZN-019 Packing Station
        └── PA-01 Pack Aisle 1
            ├── PK-R01 (4L×8S = 32 bins)
            ├── PK-R02 (4L×8S = 32 bins)
            └── PK-R03 (4L×8S = 32 bins)
```

---

## CRUD Tests Passed

| Entity | Create | Read | Update | Delete | Extra |
|--------|--------|------|--------|--------|-------|
| Warehouses | 3 created | List + Single | Capacity, phone updated | Temp created + deleted | — |
| Zones | 10 created (manual + bulk) | List by WH + Single | Name, type changed | Temp + 404 verified | Bulk create with aisles+racks+bins |
| Aisles | 16 created | List by zone | zone.aisle_count verified | Via zone delete | — |
| Racks | 43 created | List by zone/aisle | zone.rack_count, aisle.rack_count verified | Via zone delete | — |
| Bins | 886 created | List by rack/zone/WH | Status update (reserved) | Temp + 404 verified | Lock/Unlock with reason |

## Inventory Data

### SKUs (15)

| Code | Name | Category | UOM | Cost | Sell | Batch | Expiry | Serial | ID |
|------|------|----------|-----|------|------|-------|--------|--------|----|
| SKU-ELEC-001 | Samsung Galaxy S24 Ultra | Electronics | pcs | 89999 | 129999 | - | - | Yes | `eb16d88a` |
| SKU-ELEC-002 | Apple MacBook Pro 16" | Electronics | pcs | 199999 | 249999 | - | - | Yes | `a2691505` |
| SKU-ELEC-003 | Sony WH-1000XM5 Headphones | Electronics | pcs | 24999 | 29999 | - | - | - | `042bb33a` |
| SKU-PHRM-001 | Paracetamol 500mg (Strip) | Pharmaceuticals | strip | 12 | 25 | Yes | Yes | - | `92eaec22` |
| SKU-PHRM-002 | Amoxicillin 250mg (Bottle) | Pharmaceuticals | bottle | 85 | 145 | Yes | Yes | - | `929e86ac` |
| SKU-PHRM-003 | Insulin Pen (Refrigerated) | Pharmaceuticals | pcs | 450 | 720 | Yes | Yes | Yes | `281a931e` |
| SKU-FOOD-001 | Basmati Rice Premium 5kg | Food & Beverage | bag | 350 | 499 | Yes | Yes | - | `566c1fa8` |
| SKU-FOOD-002 | Amul Butter 500g | Food & Beverage | pcs | 240 | 285 | Yes | Yes | - | `c47f6d74` |
| SKU-FOOD-003 | Organic Honey 1L | Food & Beverage | bottle | 320 | 499 | Yes | Yes | - | `c7f6fcca` |
| SKU-HDWR-001 | M8 Hex Bolt (100-pack) | Hardware | pack | 180 | 299 | - | - | - | `0b91c42b` |
| SKU-HDWR-002 | 10mm PVC Pipe (3m) | Hardware | pcs | 95 | 165 | - | - | - | `3845fd24` |
| SKU-HDWR-003 | Industrial Safety Helmet | Hardware | pcs | 350 | 599 | - | - | - | `815ee0bf` |
| SKU-CHEM-001 | Isopropyl Alcohol 5L | Chemicals | can | 420 | 699 | Yes | Yes | - | `5cb63da8` |
| SKU-CHEM-002 | Acetone Industrial Grade 1L | Chemicals | bottle | 180 | 299 | Yes | Yes | - | `7b246d6c` |
| SKU-GENR-001 | Corrugated Box 18x12x6 | General | pcs | 15 | 35 | - | - | - | `3e5b3276` |

### Batches (10)

| Batch # | SKU | Mfg Date | Expiry Date | Qty | Status |
|---------|-----|----------|-------------|-----|--------|
| BT-PARA-2025-A | SKU-PHRM-001 | 2025-01-15 | 2027-01-15 | 10000 | active |
| BT-PARA-2025-B | SKU-PHRM-001 | 2025-06-01 | 2027-06-01 | 8000 | active |
| BT-AMOX-2025-A | SKU-PHRM-002 | 2025-03-10 | 2026-09-10 | 5000 | active |
| BT-INSU-2026-A | SKU-PHRM-003 | 2026-01-01 | 2026-07-01 | 1000 | active |
| BT-RICE-2026-Q1 | SKU-FOOD-001 | 2026-01-01 | 2027-06-01 | 3000 | active |
| BT-BUTR-2026-M3 | SKU-FOOD-002 | 2026-03-01 | 2026-06-15 | 5000 | active |
| BT-HONY-2025-A | SKU-FOOD-003 | 2025-08-01 | 2027-08-01 | 2000 | active |
| BT-IPA-2026-A | SKU-CHEM-001 | 2026-02-01 | 2028-02-01 | 3000 | active |
| BT-ACTN-2026-A | SKU-CHEM-002 | 2026-01-15 | 2027-07-15 | 4000 | active |
| BT-AMOX-2024-X | SKU-PHRM-002 | 2024-06-01 | **2026-04-10** | 200 | **NEAR-EXPIRY** |

### Stock Levels (20 entries across 3 warehouses)

| SKU | Warehouse | Available | Reserved | Damaged |
|-----|-----------|-----------|----------|---------|
| SKU-ELEC-001 | WH-001 Chennai | 200 | 25 | 3 |
| SKU-ELEC-002 | WH-001 Chennai | 45 | 5 | 1 |
| SKU-ELEC-003 | WH-001 Chennai | 350 | 40 | 0 |
| SKU-PHRM-001 | WH-002 Bengaluru | 8000 | 500 | 0 |
| SKU-PHRM-002 | WH-002 Bengaluru | 3500 | 200 | 50 |
| SKU-PHRM-003 | WH-002 Bengaluru | 800 | 100 | 0 |
| SKU-FOOD-001 | WH-003 Mumbai | 2500 | 300 | 0 |
| SKU-FOOD-002 | WH-003 Mumbai | 4000 | 500 | 100 |
| SKU-FOOD-003 | WH-003 Mumbai | 1500 | 150 | 0 |
| SKU-HDWR-001 | WH-003 Mumbai | 15000 | 1000 | 0 |
| SKU-HDWR-002 | WH-003 Mumbai | 8000 | 500 | 200 |
| SKU-HDWR-003 | WH-001 Chennai | 300 | 50 | 5 |
| SKU-CHEM-001 | WH-002 Bengaluru | 2000 | 100 | 0 |
| SKU-CHEM-002 | WH-002 Bengaluru | 3000 | 200 | 0 |
| SKU-GENR-001 | WH-001 Chennai | 20000 | 2000 | 0 |
| SKU-GENR-001 | WH-003 Mumbai | 15000 | 1000 | 0 |
| SKU-ELEC-001 | WH-003 Mumbai | 100 | 10 | 0 |
| SKU-PHRM-001 | WH-001 Chennai | 2000 | 100 | 0 |
| SKU-FOOD-001 | WH-001 Chennai | 1000 | 50 | 0 |
| SKU-HDWR-001 | WH-001 Chennai | 5000 | 200 | 0 |

### Stock Movements (12 recorded)

| Type | SKU | Qty | Warehouse | Notes |
|------|-----|-----|-----------|-------|
| stock_in | SKU-ELEC-001 | 200 | WH-001 | PO received from Samsung |
| stock_in | SKU-PHRM-001 | 10000 | WH-002 | Pharma shipment |
| stock_in | SKU-FOOD-001 | 3000 | WH-003 | Bulk rice delivery |
| stock_out | SKU-ELEC-003 | 50 | WH-001 | Order fulfillment |
| stock_out | SKU-PHRM-002 | 500 | WH-002 | Hospital order |
| transfer | SKU-GENR-001 | 1000 | WH-001→WH-003 | Rebalancing |
| stock_in | SKU-HDWR-001 | 5000 | WH-003 | Supplier delivery |
| stock_out | SKU-FOOD-002 | 200 | WH-003 | Retail distribution |
| stock_in | SKU-CHEM-001 | 2000 | WH-002 | Chemical shipment |
| damage | SKU-HDWR-002 | 200 | WH-003 | Water damage |
| adjustment | SKU-ELEC-001 | 3 | WH-001 | Cycle count correction |
| return | SKU-FOOD-002 | 100 | WH-003 | Customer return |

### Damaged Items (4)

| SKU | Qty | Type | Warehouse | Description | Disposition |
|-----|-----|------|-----------|-------------|-------------|
| SKU-ELEC-001 | 3 | physical | WH-001 | Screen cracked during handling | pending |
| SKU-HDWR-002 | 200 | water | WH-003 | Pipes exposed to rain | pending |
| SKU-FOOD-002 | 100 | expired | WH-003 | Batch past expiry | scrapped |
| SKU-PHRM-002 | 50 | contaminated | WH-002 | Temperature excursion | pending |

### Stock Adjustments (4)

| SKU | Warehouse | Type | Qty | Reason | Status |
|-----|-----------|------|-----|--------|--------|
| SKU-ELEC-001 | WH-001 | decrease | -3 | Cycle count damage | pending |
| SKU-GENR-001 | WH-001 | increase | +500 | Audit miscount | pending |
| SKU-PHRM-001 | WH-002 | decrease | -200 | Expired batch write-off | pending |
| SKU-HDWR-001 | WH-003 | correction | +150 | System error | pending |

### Cycle Counts (3 scheduled)

| Count # | Name | Warehouse | Zone | Priority | Date |
|---------|------|-----------|------|----------|------|
| CC-001 | Chennai General Storage Q2 Count | WH-001 | ZN-005 | high | 2026-04-07 |
| CC-002 | Bengaluru Cold Storage Spot Check | WH-002 | ZN-016 | medium | 2026-04-10 |
| CC-003 | Mumbai Raw Material Monthly Audit | WH-003 | ZN-018 | high | 2026-04-05 |

### Stock Transfers (3)

| Transfer # | Type | From | To | SKU | Qty | Reason | Status |
|------------|------|------|----|-----|-----|--------|--------|
| TRF-001 | inter-warehouse | WH-001 | WH-003 | SKU-GENR-001 | 2000 | Rebalancing | requested |
| TRF-002 | intra-warehouse | WH-002 ZN-016 | WH-002 ZN-007 | SKU-PHRM-003 | 200 | Replenishment | requested |
| TRF-003 | inter-warehouse | WH-003 | WH-001 | SKU-HDWR-001 | 1000 | Customer Order | requested |

---

## Inbound Data

### Suppliers (5)

| Code | Name | Contact | Email | Phone | GST | City | Payment | Lead | ID |
|------|------|---------|-------|-------|-----|------|---------|------|----|
| SUP-SAMSUNG | Samsung India Electronics | Rajesh Kumar | procurement@samsung.co.in | +91-9900112233 | 29AABCS1234H1Z5 | Bengaluru | 30 days | 7 days | `45a2492a` |
| SUP-CIPLA | Cipla Pharmaceuticals Ltd | Dr. Meera Patel | orders@cipla.com | +91-9800334455 | 27AABCC5678K1Z3 | Mumbai | 45 days | 5 days | `40af0c6a` |
| SUP-ITC | ITC Foods Division | Anand Sharma | supply@itcfoods.in | +91-9700556677 | 36AABCI9012L1Z1 | Hyderabad | 30 days | 3 days | `2687660b` |
| SUP-TATA | Tata Steel Industries | Vikram Singh | bulk@tatasteel.com | +91-9600778899 | 20AABCT3456M1Z7 | Jamshedpur | 60 days | 14 days | `0ad3e429` |
| SUP-BASF | BASF Chemicals India | Priya Reddy | chemicals@basf.in | +91-9500990011 | 29AABCB7890N1Z9 | Chennai | 30 days | 10 days | `70285ce1` |

### Purchase Orders (5)

| PO # | Supplier | Warehouse | Status | Items | Expected | ID |
|------|----------|-----------|--------|-------|----------|----|
| PO-001 | SUP-SAMSUNG | WH-001 Chennai | **approved** | ELEC-001(100), ELEC-002(20), ELEC-003(200) | 2026-04-10 | `578f836c` |
| PO-002 | SUP-CIPLA | WH-002 Bengaluru | **approved** | PHRM-001(5000), PHRM-002(2000), PHRM-003(500) | 2026-04-08 | `bb4a2aad` |
| PO-003 | SUP-ITC | WH-003 Mumbai | **approved** | FOOD-001(1000), FOOD-002(3000), FOOD-003(800) | 2026-04-07 | `083ee067` |
| PO-004 | SUP-TATA | WH-003 Mumbai | **draft** | HDWR-001(5000), HDWR-002(3000), HDWR-003(200) | 2026-04-12 | `ddc00b29` |
| PO-005 | SUP-BASF | WH-002 Bengaluru | **submitted** | CHEM-001(1000), CHEM-002(2000) | 2026-04-09 | `99e6d1af` |

### GRNs (3 — all completed)

| GRN # | PO | Warehouse | Dock | Vehicle | Status | Notes | ID |
|-------|-----|-----------|------|---------|--------|-------|----|
| GRN-001 | PO-001 | WH-001 | Dock A3 | TN-07-AX-4521 | **completed** | Full receipt | `57523b45` |
| GRN-002 | PO-002 | WH-002 | Dock B1 | KA-01-MK-8890 | **completed** | Partial: 4500/5000 Paracetamol | `eb5de804` |
| GRN-003 | PO-003 | WH-003 | Dock C2 | MH-04-FG-3344 | **completed** | 50 butter units damaged | `f93d0961` |

### QC Inspections (5)

| QC # | GRN | SKU | Status | Result | Inspected | Passed | Failed | ID |
|------|-----|-----|--------|--------|-----------|--------|--------|----|
| QC-001 | GRN-001 | SKU-ELEC-001 | **completed** | passed | 100 | 100 | 0 | `0f18e775` |
| QC-002 | GRN-001 | SKU-ELEC-002 | **pending** | — | — | — | — | `c991fd05` |
| QC-003 | GRN-002 | SKU-PHRM-001 | **completed** | passed | 4500 | 4480 | 20 | `41359d9b` |
| QC-004 | GRN-002 | SKU-PHRM-003 | **pending** | — | — | — | — | `eab4f634` |
| QC-005 | GRN-003 | SKU-FOOD-002 | **completed** | **failed** | 2950 | 2900 | 50 | `f86f0f60` |

### Putaway Tasks (4)

| PA # | GRN | SKU | Qty | Warehouse | Dest Zone | Priority | Status | Bin | ID |
|------|-----|-----|-----|-----------|-----------|----------|--------|-----|----|
| PA-001 | GRN-001 | SKU-ELEC-001 | 100 | WH-001 | ZN-005 | high | **completed** | BIN-039 | `6179a722` |
| PA-002 | GRN-001 | SKU-ELEC-003 | 200 | WH-001 | ZN-013 | medium | pending | — | `78ac527c` |
| PA-003 | GRN-002 | SKU-PHRM-001 | 4500 | WH-002 | ZN-007 | high | pending | — | `cc8afadb` |
| PA-004 | GRN-003 | SKU-FOOD-001 | 1000 | WH-003 | ZN-010 | medium | pending | — | `c3cbde36` |

### Inbound Flow Visualization

```
SUP-SAMSUNG ──→ PO-001 (approved) ──→ GRN-001 (completed, full) ──→ QC-001 (passed) ──→ PA-001 (completed ✅)
                                                                  ──→ QC-002 (pending)──→ PA-002 (pending)

SUP-CIPLA ────→ PO-002 (approved) ──→ GRN-002 (completed, partial) → QC-003 (passed) ──→ PA-003 (pending)
                                                                   → QC-004 (pending)

SUP-ITC ──────→ PO-003 (approved) ──→ GRN-003 (completed, damaged) → QC-005 (FAILED) ──→ PA-004 (pending)

SUP-TATA ─────→ PO-004 (draft)
SUP-BASF ─────→ PO-005 (submitted)
```

---

## Outbound Data

### Customers (5)

| Code | Name | Contact | Email | Phone | City | GST | ID |
|------|------|---------|-------|-------|------|-----|----|
| CUST-REL | Reliance Digital | Priya Nair | orders@reliancedigital.in | +91-9811001100 | Mumbai | 27AAACR1234F1Z5 | `7547daed` |
| CUST-APL | Apollo Pharmacy | Dr. Suresh Mehta | purchase@apollopharmacy.com | +91-9822002200 | Chennai | 33AAACA5678G1Z3 | `cc676998` |
| CUST-BB | BigBasket Warehouse | Rohit Verma | fulfillment@bigbasket.com | +91-9833003300 | Bengaluru | 29AABCB9012H1Z1 | `84339c08` |
| CUST-LNT | L&T Construction | Arvind Gupta | materials@lnt.com | +91-9844004400 | Mumbai | 27AABCL3456J1Z7 | `e1a5204d` |
| CUST-HCL | Hyderabad Chemicals Ltd | Kavitha Reddy | procurement@hclchem.in | +91-9855005500 | Hyderabad | 36AABCH7890K1Z9 | `eabda467` |

### Sales Orders (5)

| SO # | Customer | Warehouse | Status | Items | Priority | Expected | ID |
|------|----------|-----------|--------|-------|----------|----------|----|
| SO-001 | Reliance Digital | WH-001 | **confirmed** | ELEC-001(50), ELEC-003(100) | high | 2026-04-08 | `4ee413bf` |
| SO-002 | Apollo Pharmacy | WH-002 | **confirmed** | PHRM-001(3000), PHRM-002(1000) | high | 2026-04-06 | `4179b4d9` |
| SO-003 | BigBasket | WH-003 | **confirmed** | FOOD-001(500), FOOD-002(1000), FOOD-003(300) | medium | 2026-04-10 | `e128fbc7` |
| SO-004 | L&T Construction | WH-003 | **confirmed** | HDWR-001(3000), HDWR-002(2000), HDWR-003(100) | high | 2026-04-09 | `8515c26c` |
| SO-005 | HCL Chemicals | WH-002 | **draft** | CHEM-001(500), CHEM-002(1000) | medium | 2026-04-11 | `a820c91f` |

### Pick Lists (3)

| PL # | Strategy | Warehouse | Orders | Status | Items | Priority | ID |
|------|----------|-----------|--------|--------|-------|----------|----|
| PL-001 | single | WH-001 | SO-001 | **completed** | 2 (bin allocated: BIN-039) | high | `58bf26b7` |
| PL-002 | single | WH-002 | SO-002 | **in_progress** | 2 | high | `7497ec7d` |
| PL-003 | batch | WH-003 | SO-003, SO-004 | **pending** | 6 | high | `fdd9702b` |

### Shipments (2)

| SHP # | SO | Carrier | Tracking | Vehicle | Status | ID |
|-------|-----|---------|----------|---------|--------|----|
| SHP-001 | SO-001 | Blue Dart | BD926485710IN | TN-07-AX-9921 | **delivered** | `79f5cc0c` |
| SHP-002 | SO-002 | DTDC Express | DT774839201IN | KA-01-ZZ-4455 | **dispatched** | `b2cd070f` |

### Outbound Flow Visualization

```
CUST-REL ──→ SO-001 (confirmed) ──→ PL-001 (completed ✅) ──→ SHP-001 (delivered ✅)
CUST-APL ──→ SO-002 (confirmed) ──→ PL-002 (in_progress) ──→ SHP-002 (dispatched, in transit)
CUST-BB ───→ SO-003 (confirmed) ─┐
CUST-LNT ──→ SO-004 (confirmed) ─┴→ PL-003 (pending, batch pick)
CUST-HCL ──→ SO-005 (draft)
```

---

## Operations Data

### Returns (4)

| RET # | SO | Customer | SKU | Qty | Reason | Condition | Status | ID |
|-------|-----|----------|-----|-----|--------|-----------|--------|----|
| RET-001 | SO-001 | Reliance | SKU-ELEC-001 | 2 | Defective | defective | **received** | `6df12d42` |
| RET-002 | SO-001 | Reliance | SKU-ELEC-003 | 5 | Wrong Item | good | **processed** (restock) | `95f96e41` |
| RET-003 | SO-002 | Apollo | SKU-PHRM-001 | 100 | Damaged in Transit | damaged | pending | `c3b688c0` |
| RET-004 | SO-003 | BigBasket | SKU-FOOD-002 | 50 | Changed Mind | new | pending | `fe1dd57e` |

### Tasks (5)

| TSK # | Type | Title | Priority | Warehouse | Status | ID |
|-------|------|-------|----------|-----------|--------|----|
| TSK-001 | putaway | Putaway Samsung phones | high | WH-001 | **completed** | `922f3745` |
| TSK-002 | pick | Pick L&T Construction order | high | WH-003 | **in_progress** | `3fa9f27f` |
| TSK-003 | pack | Pack Apollo Pharmacy order | medium | WH-002 | pending | `421b43dd` |
| TSK-004 | transfer | Transfer GENR-001 boxes | low | WH-001 | pending | `c6f6f299` |
| TSK-005 | cycle_count | Monthly count ZN-018 | medium | WH-003 | pending | `26af41f3` |

### Invoices (5 with GST)

| Invoice # | Type | Party | Linked | GST Type | Subtotal | GST | Total | Status | ID |
|-----------|------|-------|--------|----------|----------|-----|-------|--------|----|
| PI-001 | purchase | SUP-SAMSUNG | PO-001/GRN-001 | intra-state | ₹1,39,99,700 | ₹25,19,946 (CGST+SGST) | ₹1,65,19,646 | **sent** | `2dff2915` |
| PI-002 | purchase | SUP-CIPLA | PO-002/GRN-002 | inter-state | ₹2,24,000 | ₹26,880 (IGST) | ₹2,50,880 | draft | `3f1ec92b` |
| SI-001 | sales | Reliance Digital | SO-001/SHP-001 | intra-state | ₹94,99,850 | ₹17,09,973 (CGST+SGST) | ₹1,12,09,823 | **paid** | `82c9416f` |
| SI-002 | sales | Apollo Pharmacy | SO-002/SHP-002 | inter-state | ₹2,20,000 | ₹26,400 (IGST) | ₹2,46,400 | draft | `0497aaf0` |
| WS-001 | service | BigBasket | WH-003 (Mar 2026) | intra-state | ₹75,000 | ₹13,500 (CGST+SGST) | ₹88,500 | draft | `418121c9` |

---

## Bugs Fixed During Testing

1. **Migration 054**: `warehouses.code` global unique → per-tenant unique
2. **Migration 055**: `zones.code`, `racks.code`, `bins.code` global unique → per-tenant unique
3. **Tenant delete cascade**: Added user + subscription cleanup before tenant delete
4. **Duplicate tenant slug check**: Added validation in createTenant service
5. **System tenant hidden**: Filtered default tenant from super admin listing
6. **Migration 056**: `stock_movements.movement_number`, `stock_adjustments.adjustment_number`, `cycle_counts.count_number`, `stock_transfers.transfer_number` global unique → per-tenant unique
7. **Overview chart**: Replaced "Movement Trend (7 Days)" with "Stock Summary by Category" and "Top SKUs by Stock"
8. **Inventory tabs**: Reduced from 9 → 8 tabs, removed Movements section, renamed to "Transfers"
9. **Migration 057**: `suppliers.code`, `purchase_orders.po_number`, `grn.grn_number`, `qc_inspections.qc_number`, `putaway_tasks.putaway_number` constraint name fix
10. **Migration 058**: Dropped leftover global unique indexes (`idx_po_number`, `idx_grn_number`, `idx_qc_number`, `idx_suppliers_code`)
11. **Migration 059**: `sales_orders.so_number`, `pick_lists.pick_list_number`, `shipments.shipment_number`, `customers.code` global unique → per-tenant unique
12. **Migration 060**: `returns.return_number`, `tasks.task_number`, `invoices.invoice_number` global unique → per-tenant unique
