# Inventori Gudang Sanvinal

Sistem manajemen stok gudang profesional dengan fitur barang masuk, barang keluar, dan ekspor laporan Excel. Aplikasi ini dirancang untuk memudahkan pengelolaan inventori secara real-time dengan antarmuka yang intuitif dan responsif.

---

## 📋 Daftar Isi

- [Informasi Umum Project](#informasi-umum-project)
- [Stack Teknologi](#stack-teknologi)
- [Arsitektur Frontend](#arsitektur-frontend)
- [Arsitektur Backend](#arsitektur-backend)
- [Struktur Folder](#struktur-folder)
- [Fitur Utama](#fitur-utama)
- [Setup dan Instalasi](#setup-dan-instalasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Build untuk Production](#build-untuk-production)

---

## 📌 Informasi Umum Project

| Aspek | Deskripsi |
|-------|-----------|
| **Nama Project** | Inventori Gudang Sanvinal |
| **Deskripsi** | Sistem manajemen stok gudang dengan fitur transaksi, laporan, dan ekspor data |
| **Versi** | 0.0.0 |
| **Tipe** | Full-Stack Web Application |
| **Status** | Development |
| **Database** | IndexedDB (Dexie.js) + Backend API |

---

## 🛠️ Stack Teknologi

### Frontend
- **Framework**: React 19.0.1
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.4.2
- **Styling**: Tailwind CSS 4.1.14
- **Routing**: React Router DOM 7.15.1
- **Icons**: Lucide React 0.546.0
- **Animations**: Motion 12.23.24
- **Database Client**: Dexie 4.4.2 (IndexedDB)
- **UI Utilities**: CLSX 2.1.1, Tailwind Merge 3.6.0
- **Export**: XLSX 0.18.5 (Excel)
- **Date Handling**: date-fns 4.2.1
- **Environment**: dotenv 17.2.3

### Backend
- **Framework**: Express.js 4.21.2
- **Runtime**: Node.js dengan tsx 4.21.0
- **TypeScript**: Diperlukan untuk type safety
- **AI Integration**: Google Generative AI 1.29.0

### Development Tools
- **TypeScript Compiler**: ~5.8.2
- **Build**: esbuild 0.25.0
- **CSS Processing**: Autoprefixer 10.4.21
- **Module Type**: ES Module

---

## 🏗️ Arsitektur Frontend

### Arsitektur Keseluruhan
```
┌─────────────────────────────────────────────┐
│         React Application (Client)          │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │      React Router (Routing)         │  │
│  │  - Dashboard                        │  │
│  │  - Barang Masuk/Keluar              │  │
│  │  - Master Produk/Salesman           │  │
│  │  - Laporan                          │  │
│  │  - Settings                         │  │
│  └─────────────────────────────────────┘  │
│           ↓                ↓               │
│  ┌──────────────────┐  ┌────────────┐    │
│  │  Pages Components│  │ UI Library │    │
│  │  (TSX)           │  │ (Tailwind) │    │
│  └──────────────────┘  └────────────┘    │
│           ↓                                │
│  ┌─────────────────────────────────────┐  │
│  │   Data Layer (Dexie - IndexedDB)    │  │
│  │  - Products Table                   │  │
│  │  - Salesmen Table                   │  │
│  │  - Transactions Table               │  │
│  └─────────────────────────────────────┘  │
│           ↓                                │
│  ┌─────────────────────────────────────┐  │
│  │   Browser Storage & API Calls       │  │
│  └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### Struktur File Frontend
```
src/
├── main.tsx              # Entry point aplikasi
├── App.tsx               # Main component dengan routing
├── db.ts                 # Dexie database schema & interfaces
├── index.css             # Global styles
├── lib/
│   └── utils.ts          # Utility functions (CLSX, merge utilities)
└── pages/                # Page components (route handlers)
    ├── Dashboard.tsx     # Dashboard overview
    ├── BarangMasuk.tsx   # Incoming goods management
    ├── BarangKeluar.tsx  # Outgoing goods management
    ├── MasterProduk.tsx  # Product master data CRUD
    ├── MasterSalesman.tsx# Salesman master data CRUD
    ├── Laporan.tsx       # Daily reports & analytics
    └── Settings.tsx      # Application settings
```

### Data Model (Dexie Schema)

#### Product Interface
```typescript
interface Product {
  id?: number;           // Auto-increment primary key
  name: string;         // Product name
  sku: string;          // Stock Keeping Unit
  unit: string;         // Unit of measurement
}
```

#### Salesman Interface
```typescript
interface Salesman {
  id?: number;          // Auto-increment primary key
  name: string;         // Salesman name
  code: string;         // Unique salesman code
}
```

#### Transaction Interface
```typescript
interface Transaction {
  id?: number;                           // Auto-increment primary key
  date: Date;                           // Transaction date
  type: 'IN' | 'OUT';                   // Barang Masuk or Keluar
  docNumber: string;                    // Auto-generated:
                                        // - SP-DDMMYYYY for IN
                                        // - SJ-DDMMYYYY-NAME for OUT
  productId: number;                    // Foreign key to Product
  salesmanId?: number;                  // Foreign key to Salesman (only for OUT)
  qty: number;                          // Quantity
  note?: string;                        // Optional notes
}
```

### Teknologi UI/UX
- **Styling**: Tailwind CSS dengan Vite plugin
- **Icons**: Lucide React untuk ikon konsisten
- **Animations**: Motion (Framer Motion alternative) untuk smooth transitions
- **Responsiveness**: Mobile-first design dengan Tailwind CSS
- **Date Management**: date-fns untuk manipulasi tanggal

### Flow Data Frontend
```
User Interaction
    ↓
React Component State
    ↓
Dexie Database (IndexedDB)
    ↓
Local Storage (app_name, settings)
    ↓
UI Re-render
    ↓
Display Results
```

---

## 🖧 Arsitektur Backend

### Backend Stack
- **Framework**: Express.js 4.21.2
- **Language**: TypeScript
- **Runtime**: Node.js dengan tsx
- **AI Integration**: Google Generative AI SDK

### Struktur Backend (Potensial)
Berdasarkan package.json, backend Express.js kemungkinan besar menangani:

```
Backend (Node.js + Express)
│
├── API Routes
│   ├── /api/products       # CRUD Products
│   ├── /api/salesmen       # CRUD Salesmen
│   ├── /api/transactions   # CRUD Transactions
│   └── /api/reports        # Generate Reports
│
├── Controllers
│   ├── productController
│   ├── salesmanController
│   ├── transactionController
│   └── reportController
│
├── Services
│   ├── productService
│   ├── salesmanService
│   ├── transactionService
│   └── reportService
│
├── Middleware
│   ├── errorHandler
│   ├── validation
│   └── authentication (optional)
│
├── Utils
│   ├── docNumberGenerator  # Generate SP-DDMMYYYY, SJ-DDMMYYYY-NAME
│   ├── reportGenerator     # Generate Excel reports
│   └── validators
│
└── AI Integration
    └── Google Generative AI  # Potential for smart insights
```

### API Endpoints (Expected)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/products` | Ambil semua produk |
| POST | `/api/products` | Buat produk baru |
| PUT | `/api/products/:id` | Update produk |
| DELETE | `/api/products/:id` | Hapus produk |
| GET | `/api/salesmen` | Ambil semua salesman |
| POST | `/api/salesmen` | Buat salesman baru |
| PUT | `/api/salesmen/:id` | Update salesman |
| DELETE | `/api/salesmen/:id` | Hapus salesman |
| GET | `/api/transactions` | Ambil semua transaksi |
| POST | `/api/transactions` | Buat transaksi baru |
| PUT | `/api/transactions/:id` | Update transaksi |
| DELETE | `/api/transactions/:id` | Hapus transaksi |
| GET | `/api/reports/daily` | Generate laporan harian |
| GET | `/api/reports/export` | Export data ke Excel |

### Communication Pattern
```
Frontend (React)
    ↓ HTTP Request (JSON)
Backend (Express)
    ↓ Process Data
Database / Dexie
    ↓ Return Result
Backend (Express)
    ↓ HTTP Response (JSON)
Frontend (React)
    ↓ Update State & UI
Display Results
```

---

## 📁 Struktur Folder

```
Inventori-Gudang-/
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Main app component dengan routing
│   ├── db.ts                    # Dexie database schema
│   ├── index.css                # Global CSS
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   └── pages/
│       ├── Dashboard.tsx        # Dashboard page
│       ├── BarangMasuk.tsx      # Incoming goods page
│       ├── BarangKeluar.tsx     # Outgoing goods page
│       ├── MasterProduk.tsx     # Product master page
│       ├── MasterSalesman.tsx   # Salesman master page
│       ├── Laporan.tsx          # Reports page
│       └── Settings.tsx         # Settings page
├── index.html                   # HTML template
├── package.json                 # Dependencies & scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── metadata.json                # Project metadata
└── README.md                    # This file
```

---

## ✨ Fitur Utama

### 1. **Dashboard**
   - Ringkasan stok terkini
   - Statistik barang masuk/keluar
   - Visualisasi data dengan grafik

### 2. **Master Data Management**
   - **Master Produk**: Create, Read, Update, Delete produk
   - **Master Salesman**: Create, Read, Update, Delete salesman

### 3. **Transaction Management**
   - **Barang Masuk (IN)**: Pencatatan barang yang masuk ke gudang
     - Auto-generate document number: `SP-DDMMYYYY`
     - Track quantity dan tanggal
   
   - **Barang Keluar (OUT)**: Pencatatan barang yang keluar dari gudang
     - Auto-generate document number: `SJ-DDMMYYYY-SALESMANNAME`
     - Link dengan salesman
     - Track quantity dan tanggal

### 4. **Laporan Harian**
   - View transaksi berdasarkan tanggal
   - Filter dan search functionality
   - Analytics dan summary

### 5. **Export & Reporting**
   - Export data ke format Excel (.xlsx)
   - Custom report generation
   - Laporan berbasis periode

### 6. **Pengaturan**
   - Konfigurasi nama aplikasi
   - User preferences
   - Local storage management

---

## 🚀 Setup dan Instalasi

### Prerequisites
- Node.js 18+ dan npm/yarn
- Git

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/perisulungharlambang-boop/Inventori-Gudang-.git
   cd Inventori-Gudang-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables** (jika diperlukan)
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi Anda
   ```

---

## ▶️ Menjalankan Aplikasi

### Development Mode
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000` dengan HMR (Hot Module Replacement) enabled.

### Type Checking
```bash
npm run lint
```
Menjalankan TypeScript compiler untuk mengecek type errors tanpa emit.

### Preview Production Build
```bash
npm run preview
```

---

## 📦 Build untuk Production

### Build Aplikasi
```bash
npm run build
```
Output akan berada di folder `dist/`.

### Clean Build Artifacts
```bash
npm run clean
```
Menghapus folder `dist` dan file `server.js`.

### Specifications
- **Bundle Tool**: Vite
- **Output Format**: ES Modules
- **CSS**: Tailwind CSS production-optimized
- **JavaScript**: Minified dan optimized

---

## 🎯 Workflow Penggunaan

### Untuk Pengguna (End User)
1. Buka aplikasi di browser
2. Navigate ke halaman yang sesuai menggunakan sidebar
3. Lakukan CRUD operations pada master data
4. Catat transaksi barang masuk/keluar
5. Lihat laporan dan analytics di Dashboard
6. Export data ke Excel jika diperlukan

### Untuk Developer
1. Setup development environment
2. Jalankan `npm run dev` untuk development server
3. Edit components di folder `src/pages/`
4. Database Dexie akan auto-sync dengan IndexedDB
5. Jalankan `npm run lint` untuk check TypeScript
6. Build dengan `npm run build` untuk production

---

## 📊 Database Schema Visualization

```
Products Table
├── id (PK)
├── name (indexed)
├── sku (indexed)
└── unit

Salesmen Table
├── id (PK)
├── name (indexed)
└── code (indexed)

Transactions Table
├── id (PK)
├── date (indexed)
├── type (indexed)
├── docNumber (indexed, unique)
├── productId (indexed, FK→Products.id)
├── salesmanId (indexed, FK→Salesmen.id, nullable)
├── qty
└── note
```

---

## 🔒 Data Persistence

- **Local Storage**: Menyimpan app_name dan user preferences
- **IndexedDB (Dexie)**: Menyimpan semua master data dan transactions
- **Backend Database**: Untuk persistence dan backup data (optional)

---

## 🚀 Future Enhancements

- [ ] Integration dengan backend database (MySQL/PostgreSQL)
- [ ] User authentication dan authorization
- [ ] Real-time data synchronization
- [ ] AI-powered inventory forecasting
- [ ] Mobile app version (React Native)
- [ ] Advanced analytics dan business intelligence
- [ ] Multi-warehouse support
- [ ] Batch operations
- [ ] API documentation (Swagger/OpenAPI)

---

## 📝 Notes

- Aplikasi menggunakan client-side database (Dexie/IndexedDB) untuk offline capability
- Document numbers di-generate otomatis berdasarkan tanggal dan tipe transaksi
- Semua styling menggunakan Tailwind CSS utility classes
- Frontend fully typed dengan TypeScript untuk development safety

---

## 📄 Lisensi

[Tentukan lisensi project Anda di sini]

---

## 👨‍💻 Kontributor

- Tim Development

---

## 📞 Support

Untuk pertanyaan atau masalah, silahkan buat issue di repository ini.

---

**Last Updated**: May 2026
