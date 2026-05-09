# 🐺 Cerberus Gadget Store

> **Full-Stack Smart Gadget Marketplace** — React · Node.js · Oracle DB · MongoDB

A production-ready e-commerce system built for academic coursework, featuring a premium dark UI, JWT authentication, PL/SQL stored procedures, and real-time MongoDB analytics.

---

## 📁 Project Structure

```
Cerberus Gadget Store/
├── frontend-react/        # React + Vite + Tailwind CSS
├── backend-api/           # Node.js + Express REST API (MVC)
├── oracle-db/             # SQL schema, sequences, PL/SQL, sample data
├── mongodb/               # MongoDB seed script
└── README.md
```

---

## ⚙️ Tech Stack

| Layer       | Technology                               |
|-------------|------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, React Router |
| Backend     | Node.js, Express, JWT, bcrypt, multer    |
| Main DB     | Oracle Database (XE / Cloud)             |
| Analytics DB| MongoDB Atlas / Local                    |
| Auth        | JWT (access + refresh tokens)            |
| Security    | bcrypt, helmet, CORS, parameterized SQL  |

---

## 🚀 SETUP & RUN GUIDE

### Prerequisites — Install These First

| Tool            | Version | Download |
|-----------------|---------|----------|
| Node.js         | 18+     | [nodejs.org](https://nodejs.org) |
| Oracle Database | XE 21c+ | [oracle.com/database/technologies/xe-downloads.html](https://www.oracle.com/database/technologies/xe-downloads.html) |
| SQL Developer   | Any     | [oracle.com/tools/downloads/sqldev-downloads.html](https://www.oracle.com/tools/downloads/sqldev-downloads.html) |
| MongoDB Atlas   | Cloud   | [cloud.mongodb.com](https://cloud.mongodb.com) — Free Tier |

---

## STEP 1 — Configure Environment Variables

Open `backend-api/.env` and fill in your credentials:

```env
PORT=5000
NODE_ENV=development

# Oracle Database — fill in YOUR values
ORACLE_USER=your_oracle_username
ORACLE_PASSWORD=your_oracle_password
ORACLE_CONNECT_STRING=localhost/XEPDB1

# MongoDB — paste your Atlas connection string
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cerberus_gadgets

# JWT — these are already set, no change needed
JWT_SECRET=cerberus_gadget_store_super_secret_jwt_key_2026
JWT_REFRESH_SECRET=cerberus_gadget_store_refresh_secret_2026
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Oracle Connection String Examples:
| Setup         | ORACLE_CONNECT_STRING value       |
|---------------|-----------------------------------|
| Oracle XE Local | `localhost/XEPDB1`              |
| Oracle XE (CDB) | `localhost/XE`                  |
| Oracle Cloud  | `host:1521/service_name`          |

---

## STEP 2 — Set Up Oracle Database

Open **SQL Developer** and connect to your Oracle instance.

Run these scripts **in order** (File → Open → Run each one):

```
oracle-db/01_schema.sql        ← Creates all 15 tables
oracle-db/02_sequences.sql     ← Creates all sequences
oracle-db/03_indexes.sql       ← Creates performance indexes
oracle-db/04_plsql_procedures.sql  ← Place_Order, Process_Payment, etc.
oracle-db/05_plsql_functions.sql   ← Get_Total_Revenue, reports & views
oracle-db/06_triggers.sql      ← Stock reduction, audit log triggers
oracle-db/07_sample_data.sql   ← 15 products + test accounts
```

### How to run in SQL Developer:
1. Connect to your schema/user
2. Open the file: **File → Open File...**
3. Press **F5** or click **Run Script**
4. Repeat for each file in order

### Or run via SQL*Plus:
```sql
@C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\oracle-db\01_schema.sql
@C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\oracle-db\02_sequences.sql
@C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\oracle-db\03_indexes.sql
@C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\oracle-db\04_plsql_procedures.sql
@C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\oracle-db\05_plsql_functions.sql
@C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\oracle-db\06_triggers.sql
@C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\oracle-db\07_sample_data.sql
```

---

## STEP 3 — Install Backend Dependencies

Open **PowerShell** or **Command Prompt**:

```powershell
cd "C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\backend-api"
npm install
```

> ✅ This installs: express, oracledb, mongoose, jsonwebtoken, bcryptjs, multer, helmet, cors, morgan, dotenv

---

## STEP 4 — Seed MongoDB (Optional but Recommended)

This populates MongoDB with demo activity logs, product views, searches, etc.:

```powershell
cd "C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\backend-api"
npm run seed-mongo
```

You should see:
```
✅ Connected to MongoDB
🗑  Cleared existing data
✅ MongoDB seed data inserted!
   - Activity logs: 6
   - Product views: 50
   - Searches: 10
```

---

## STEP 5 — Install Frontend Dependencies

```powershell
cd "C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\frontend-react"
npm install
```

---

## STEP 6 — Start the Application

### Terminal 1 — Start Backend API:
```powershell
cd "C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\backend-api"
npm run dev
```

You should see:
```
✅ MongoDB connected
✅ Oracle DB pool initialized
🐺 Cerberus Gadget Store API running on port 5000
   URL: http://localhost:5000/api
   Health: http://localhost:5000/api/health
```

### Terminal 2 — Start Frontend:
```powershell
cd "C:\Users\CerberusMrXi\Desktop\Cerberus Gadget Store\frontend-react"
npm run dev
```

You should see:
```
  VITE v5.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Open in browser:
```
http://localhost:5173
```

---

## 🧪 Test Accounts

All accounts use password: **`Admin@123`**

| Role     | Email                              | Access |
|----------|------------------------------------|--------|
| Admin    | admin@cerberusgadgets.com         | Full admin panel |
| Seller   | techseller@cerberusgadgets.com    | Seller dashboard |
| Customer | customer@cerberusgadgets.com      | Shop + orders    |

> 💡 **Quick Login:** On the Login page, click the colored role buttons to auto-fill credentials.

---

## 🗺️ Application Pages

| URL                      | Description                     | Access    |
|--------------------------|---------------------------------|-----------|
| `/`                      | Home — Hero, categories, products | Public  |
| `/products`              | Product listing with filters    | Public    |
| `/products/:id`          | Product detail + reviews        | Public    |
| `/login`                 | Login page                      | Public    |
| `/register`              | Register (customer or seller)   | Public    |
| `/cart`                  | Shopping cart                   | Customer  |
| `/checkout`              | Checkout + payment              | Customer  |
| `/orders`                | Order history                   | Customer  |
| `/orders/:id`            | Order detail + delivery tracking| Customer  |
| `/wishlist`              | Wishlist                        | Customer  |
| `/dashboard/customer`    | Customer dashboard              | Customer  |
| `/dashboard/seller`      | Seller dashboard + products     | Seller    |
| `/dashboard/admin`       | Full admin panel                | Admin     |

---

## 🔗 API Endpoints Summary

```
POST   /api/auth/register       Register new account
POST   /api/auth/login          Login
GET    /api/auth/me             Get current user
PUT    /api/auth/profile        Update profile

GET    /api/products            List products (with filters)
GET    /api/products/featured   Featured products
GET    /api/products/:id        Product detail
POST   /api/products            Create product (seller)
PUT    /api/products/:id        Update product (seller)
DELETE /api/products/:id        Soft-delete product

GET    /api/categories          All categories

GET    /api/cart                View cart
POST   /api/cart/add            Add to cart
PUT    /api/cart/:itemId        Update quantity
DELETE /api/cart/:itemId        Remove item

POST   /api/orders              Place order (calls Place_Order PL/SQL)
GET    /api/orders              My orders
GET    /api/orders/:id          Order detail
PUT    /api/orders/:id/cancel   Cancel order

POST   /api/payments            Process payment (calls Process_Payment)

GET    /api/wishlist            View wishlist
POST   /api/wishlist            Add to wishlist
DELETE /api/wishlist/:productId Remove from wishlist

GET    /api/reviews/product/:id Product reviews
POST   /api/reviews             Add review

GET    /api/delivery/:orderId   Delivery tracking
PUT    /api/delivery/:orderId/status  Update status

GET    /api/seller/dashboard    Seller stats
GET    /api/seller/products     Seller's products
GET    /api/seller/orders       Orders for seller

GET    /api/admin/dashboard     Admin stats + charts
GET    /api/admin/users         All users
PUT    /api/admin/users/:id/toggle  Activate/deactivate user
GET    /api/admin/failed-payments   Failed payment report
GET    /api/admin/low-stock         Low stock alert
GET    /api/admin/activity-logs     MongoDB activity logs

GET    /api/analytics/overview      Combined Oracle+MongoDB analytics
GET    /api/analytics/revenue       Revenue by date range
```

---

## 🗄️ Oracle Database Objects

### Tables (15)
`users` · `customers` · `sellers` · `admins` · `categories` · `products` · `inventory` · `cart` · `cart_items` · `orders` · `order_items` · `payments` · `payment_audit_log` · `deliveries` · `reviews` · `wishlist`

### PL/SQL Procedures
| Procedure | Description |
|-----------|-------------|
| `Place_Order` | Places order from cart, validates stock, creates delivery |
| `Process_Payment` | Records payment, updates order status |
| `Update_Stock` | Manually adjust inventory (ADD or SET) |
| `Cancel_Order` | Cancels order and restores stock |

### PL/SQL Functions
| Function | Description |
|----------|-------------|
| `Get_Total_Revenue(start, end)` | Total revenue for date range |
| `Get_Top_Selling_Product(start, end)` | Returns product_id of best seller |

### Triggers
| Trigger | Description |
|---------|-------------|
| `trg_reduce_stock_after_order` | Reduces inventory on order_item insert |
| `trg_prevent_negative_stock` | Raises error if stock goes below 0 |
| `trg_payment_audit_log` | Logs every payment status change |
| `trg_update_product_rating` | Recalculates avg rating on review change |
| `trg_orders_updated_at` | Auto-updates order timestamp |
| `trg_products_updated_at` | Auto-updates product timestamp |

### Report Views
| View | Description |
|------|-------------|
| `vw_top_selling_products` | Products ranked by units sold |
| `vw_revenue_by_date` | Daily revenue summary |
| `vw_failed_payments` | All failed payment records |
| `vw_low_stock_alerts` | Products below threshold |

---

## 🍃 MongoDB Collections

| Collection | Purpose |
|------------|---------|
| `activity_logs` | Login/logout, cart actions, checkouts |
| `product_views` | Per-product page view tracking |
| `searches` | Search query history with filters |
| `payment_attempts` | All payment tries (success & failed) |
| `delivery_events` | Real-time delivery status updates |

---

## 🔐 Security Features

- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT** access tokens (1h) + refresh tokens (7d)
- **Role-based access control** (customer / seller / admin)
- **Helmet.js** HTTP security headers
- **Parameterized Oracle queries** (no SQL injection)
- **CORS** restricted to frontend URL
- **Input validation** on all endpoints

---

## 🛠️ Troubleshooting

### Oracle connection fails:
```
❌ Failed to start server: Oracle pool init failed
```
**Fix:** Check `ORACLE_USER`, `ORACLE_PASSWORD`, `ORACLE_CONNECT_STRING` in `.env`
For Oracle XE: `ORACLE_CONNECT_STRING=localhost/XEPDB1`

### Oracle thin mode error:
```
NJS-138: connections to this database server version are not supported
```
**Fix:** Your Oracle version may be older than 21c. Add this to `config/database.js`:
```js
oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_21_3' });
```
And install Oracle Instant Client from: https://www.oracle.com/database/technologies/instant-client.html

### MongoDB connection fails:
```
❌ Failed to start server: MONGO_URI not set in .env
```
**Fix:** Set `MONGO_URI` in `backend-api/.env` with your MongoDB Atlas connection string.

### Frontend shows blank page:
```
npm run dev  →  check browser console for errors
```
**Fix:** Make sure the backend is running on port 5000 first.

### Port already in use:
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Fix:** Change `PORT=5001` in `.env` and update `vite.config.js` proxy target.

---

## 📦 Sample Data Included

**15 pre-loaded products:**
iPhone 16 Pro · Samsung Galaxy S25 Ultra · MacBook Pro M4 · Dell XPS 15 ·
Apple Watch Ultra 2 · Samsung Galaxy Watch 7 · AirPods Pro 2 · Sony WH-1000XM5 ·
PS5 Slim · Razer DeathAdder V3 · Canon EOS R6 Mark II · Google Pixel 9 Pro ·
ASUS ROG Zephyrus G16 · Bose QuietComfort Ultra · GoPro HERO13 Black

**6 Categories:** Smartphones · Laptops · Smartwatches · Audio · Gaming · Cameras

---

## 👨‍💻 Developer Notes

- The **Vite proxy** (`/api → http://localhost:5000`) means the frontend calls `/api/...` and it automatically forwards to the backend — no CORS issues in development.
- Product images use **Unsplash URLs** in sample data (no local storage needed for demo).
- The **payment simulation** has a 90% success rate — to test failed payments, try multiple times.
- **oracledb thin mode** is enabled by default (no Oracle Client install needed for Oracle 21c+).

---

*Built with ❤️ for Cerberus Gadget Store · React · Node.js · Oracle · MongoDB*
