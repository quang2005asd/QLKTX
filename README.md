# KTX Frontend Architecture

Tai lieu nay mo ta cau truc frontend chung cho du an `Qly_ktx`.

Muc tieu la tach ro:

- `frontend chung`
- `backend rieng cua tung nhom`
- `modules` trong frontend chi dung de hien thi giao dien va goi API

## 1. Tong quan

`Qly_ktx` la frontend chung cua he thong KTX.

No khong chua database va khong xu ly business logic nang. Nhiem vu cua no la:

- hien thi giao dien
- dieu huong trang bang router
- quan ly state chung
- goi API cua backend

Mo hinh dung la:

```text
Qly_ktx (Frontend chung)
  -> goi API RoomBuildingService
  -> goi API StudentContractService
  -> goi API BillingMaintenanceService
```

## 2. FE va BE

### Frontend

Frontend nam trong project:

```text
Qly_ktx
```

Frontend phu trach:

- giao dien
- route
- layout
- store
- goi URL API

### Backend

Backend la cac service rieng cua tung nhom, vi du:

```text
RoomBuildingService
StudentContractService
BillingMaintenanceService
```

Moi backend service phu trach:

- database
- business logic
- controller / repository / service
- event / message neu can
- expose API cho frontend dung

## 3. Modules trong frontend dung de lam gi

Thu muc `modules/` trong frontend khong phai la backend.

No chi la cach chia frontend theo nghiep vu.

Moi module thuong gom:

- `views/`: giao dien
- `api/`: file goi URL backend
- `components/`: component rieng cua module
- `routes.ts`: route cua module

Vi du:

```text
src/modules/room-building/views/BuildingListView.vue
src/modules/room-building/api/buildingApi.ts
src/modules/room-building/routes.ts
```

Y nghia:

- `BuildingListView.vue`: trang giao dien danh sach toa nha
- `buildingApi.ts`: goi API nhu `GET /api/buildings`
- `routes.ts`: khai bao route de vao man nay

## 4. Router dung de lam gi

`router` trong frontend dung de dieu huong giua cac trang.

Can phan biet:

- `route frontend`: duong dan trang giao dien
- `API backend`: duong dan lay du lieu

Vi du:

```text
Frontend route: /room/buildings
Backend API:    /api/buildings
```

Flow dung thuong la:

```text
Nguoi dung vao /room/buildings
-> router mo BuildingListView.vue
-> view goi /api/buildings
-> hien thi du lieu len giao dien
```

Vay `router` co nhiem vu:

- map URL trang web sang Vue component
- gom route tu 3 module
- tach route public va private
- kiem tra dang nhap
- kiem tra role neu can

## 5. Cau truc 

```text
ktx-frontend/
├── src/
│   ├── core/
│   │   ├── api/                 # axios instance, interceptor JWT, config chung
│   │   ├── assets/              # anh, icon, CSS global
│   │   ├── components/          # component dung chung
│   │   ├── layouts/             # AppShell, Sidebar, Header, AuthLayout
│   │   ├── stores/              # Pinia dung chung: authStore, userStore...
│   │   ├── utils/               # formatDate, formatCurrency...
│   │   └── views/
│   │       └── LoginView.vue    # man dang nhap dung chung
│   │
│   ├── modules/
│   │   ├── room-building/       # Nhom 1 - Room & Building
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   ├── routes.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── student-contract/    # Nhom 2 - Student & Contract
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   ├── routes.ts
│   │   │   └── types.ts
│   │   │
│   │   └── billing-maintenance/ # Nhom 3 - Billing & Maintenance
│   │       ├── api/
│   │       ├── components/
│   │       ├── views/
│   │       ├── routes.ts
│   │       └── types.ts
│   │
│   ├── router/
│   │   └── index.ts             # gom route login + route cua 3 module
│   ├── App.vue
│   └── main.ts
```

## 6. Nguyen tac to chuc

- `core/` chi chua phan dung chung cho toan app
- `modules/` chua phan giao dien va goi API cua tung nhom
- moi module tu quan ly `views`, `api`, `components`, `routes`
- `router/index.ts` la noi gom route cua ca he thong
- `main.ts` la diem vao cua app

## 7. Quy uoc dat ten

- dung `api/` thay vi `services/` de ro y la file goi backend
- dung `routes.ts` thay vi `router.js` vi module chi export danh sach route
- uu tien TypeScript dong bo

Vi du:

- `buildingApi.ts`
- `roomApi.ts`
- `contractApi.ts`
- `billingApi.ts`
- `BuildingListView.vue`
- `RoomDetailView.vue`

## 8. Cach phan chia theo nhom

### Nhom 1 - Room & Building

Phu trach:

- toa nha
- loai phong
- phong
- giuong
- thiet bi
- so do tang

Thu muc chinh:

```text
src/modules/room-building/
```

### Nhom 2 - Student & Contract

Phu trach:

- sinh vien
- don dang ky phong
- hop dong
- danh sach o

Thu muc chinh:

```text
src/modules/student-contract/
```

### Nhom 3 - Billing & Maintenance

Phu trach:

- dang nhap / xac thuc
- hoa don
- thanh toan
- bao tri / su co

Thu muc chinh:

```text
src/modules/billing-maintenance/
```

## 9. Vi du router tong

```ts
import { createRouter, createWebHistory } from 'vue-router'
import { roomBuildingRoutes } from '@/modules/room-building/routes'
import { studentContractRoutes } from '@/modules/student-contract/routes'
import { billingMaintenanceRoutes } from '@/modules/billing-maintenance/routes'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/core/views/LoginView.vue') },
    ...roomBuildingRoutes,
    ...studentContractRoutes,
    ...billingMaintenanceRoutes,
  ],
})
```

## 10. Vi du goi API

Tat ca request HTTP nen di qua `src/core/api/`.

Vi du:

```text
src/core/api/http.ts
src/modules/room-building/api/buildingApi.ts
src/modules/room-building/api/roomApi.ts
src/modules/student-contract/api/contractApi.ts
src/modules/billing-maintenance/api/billingApi.ts
```

Muc tieu:

- gan JWT neu co
- xu ly loi chung
- doi base URL theo tung backend service

## 11. Mapping voi project hien tai

Co the sap xep `Qly_ktx` hien tai dan theo huong sau:

- `shared/` -> `core/`
- `modules/room/` -> `modules/room-building/`
- `modules/contract/` -> `modules/student-contract/`
- `modules/billing/` -> `modules/billing-maintenance/`

Khong can doi het trong 1 lan. Co the chuyen tung module de tranh vo import va route.

## 12. Ket luan ngan

- `Qly_ktx` = frontend chung
- `modules/.../api` = noi goi URL backend
- `router` = dieu huong giua cac trang frontend
- `backend service` = viet rieng o project khac

Neu can mo rong sau nay, chi can them API va view trong module tuong ung, khong can tron logic backend vao frontend.

## 13. Deploy frontend len Render

`Qly_ktx` co the deploy rieng len Render duoi dang `Static Site`.

### Cach nhanh trong dashboard

1. Push repo `Qly_ktx` len GitHub.
2. Vao Render -> `New` -> `Static Site`.
3. Chon repo `Qly_ktx`.
4. Dat:

```text
Build Command: npm install && npm run build
Publish Directory: dist
```

5. Them cac environment variable:

```text
VITE_ROOM_BUILDING_API_URL=https://your-room-building-api
VITE_STUDENT_CONTRACT_API_URL=https://your-student-contract-api
VITE_BILLING_MAINTENANCE_API_URL=https://your-billing-api
```

### File da chuan bi san cho Render

- `render.yaml`: cau hinh service static
- `public/_redirects`: rewrite tat ca route ve `index.html`

File `_redirects` la bat buoc khi frontend dung `createWebHistory()` trong Vue Router, neu khong refresh o route con se bi `404`.
