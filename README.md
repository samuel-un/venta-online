# OrderManager Pro - Retail Management System

<p align="center">
  <img src="https://img.icons8.com/fluency/96/shop.png" alt="OrderManager Pro Logo">
</p>

# 📦 OrderManager Pro - Retail Management System 🚀

OrderManager Pro is a **comprehensive full-stack web platform** designed to streamline retail order processing. It provides a real-time dashboard for sales monitoring, order status tracking (Pending, Completed, Cancelled), and customer management.

This repository features a **Dockerized Laravel backend** optimized for cloud deployment and a responsive **React-based frontend**, ensuring high performance and scalability.

---

## 🚀 Live Deployment

-   **Frontend (Render Static Site):** [https://venta-online-470g.onrender.com](https://venta-online-470g.onrender.com)
-   **Backend API (Render Web Service):** [https://ordermanager-api-g6ia.onrender.com](https://ordermanager-api-g6ia.onrender.com)

✅ The project is currently **fully deployed and production-ready**.

---

## 📌 Features

-   📊 **Real-time Dashboard**: Visual KPIs for total revenue, active orders, and monthly growth.
-   🛍️ **Order Management (CRUD)**: Create, view, update, and change status of retail orders efficiently.
-   🔍 **Smart Search & Pagination**: Filter orders by customer name or email instantly.
-   🚦 **Status Workflow**: Dedicated logic for handling Pending, Completed, and Cancelled states.
-   ☁️ **Cloud-Native Architecture**: Fully Dockerized backend with PostgreSQL integration on Render.
-   🔄 **Automatic Seeding**: Pre-populated with realistic Spanish market data for instant demo usage.
-   🛠 **Built with Laravel 11 & React 18**: Using modern standards like Hooks, Axios, and Eloquent ORM.

---

## ⚙️ Technologies Used

-   **Backend**:

    -   Laravel 11 (PHP 8.2)
    -   PostgreSQL (Production Database)
    -   Docker & Docker Compose
    -   Eloquent ORM
    -   Faker (for realistic data seeding)

-   **Frontend**:

    -   React 18 (Vite)
    -   Tailwind CSS (Styling)
    -   Axios (API Consumption)
    -   Heroicons (UI Icons)

-   **Infrastructure & Deployment**:
    -   **Render** (Web Services & Static Sites)
    -   **Docker** (Containerization)
    -   **Git & GitHub** (Version Control)

---

## 🛠 Backend Installation

```bash
# 1. Clone the repository
git clone https://github.com/samuel-un/Gestor-Pedidos-Online

# 2. Enter the backend directory
cd backend-venta-online

# 3. Install PHP dependencies
composer install

# 4. Configure Environment
cp .env.example .env
# Update DB_CONNECTION, DB_HOST, etc. in your .env file

# 5. Generate Application Key
php artisan key:generate

# 6. Run Migrations & Seeders
php artisan migrate:fresh --seed

# 7. Start the Development Server
php artisan serve
```

---

## 💻 Frontend Installation

```bash
# 1. Enter the frontend directory
cd frontend-venta-online

# 2. Install Node dependencies
npm install

# 3. Configure Environment Variable
# Create a .env file and add your backend URL (local or production)
echo "VITE_API_URL=http://127.0.0.1:8000/api" > .env

# 4. Start the Development Server
npm run dev
```

The application will be available at http://localhost:5173.

---

## 🖼️ Frontend Screenshots

### Main Dashboard & Statistics

![Main Dashboard](https://res.cloudinary.com/dgbngcvkl/image/upload/v1765985524/pantalla-principal_sbzgvs.png)

### Order Status Management

![Order Status](https://res.cloudinary.com/dgbngcvkl/image/upload/v1765985524/ajustar-estado_up2cp3.png)

### Real-time Notifications

![Notifications](https://res.cloudinary.com/dgbngcvkl/image/upload/v1765985525/mensaje_f9zot8.png)

### Order Management List

![Order List](https://res.cloudinary.com/dgbngcvkl/image/upload/v1765985524/list-order_nxq5tr.png)

### Create New Order

![Create Order](https://res.cloudinary.com/dgbngcvkl/image/upload/v1765985525/create-order_xsh7ah.png)

### Get Single Order

![Single Order](https://res.cloudinary.com/dgbngcvkl/image/upload/v1765985524/get-single-order_aipmzb.png)

### Update Order

![Update Order](https://res.cloudinary.com/dgbngcvkl/image/upload/v1765985525/update-order_muq29s.png)

### Update Order Status

![Update Status](https://res.cloudinary.com/dgbngcvkl/image/upload/v1765985524/update-order-status_fazukx.png)

---

## 🧪 API Tests (Postman)

1. List All Orders (GET /api/orders)
2. Create New Order (POST /api/orders)
3. Get Single Order Detail (GET /api/orders/{id})
4. Update Order Information (PUT /api/orders/{id})
5. Update Order Status (PATCH /api/orders/{id}/status)

---

## 📊 Methodology

This project was built following Clean Architecture principles, separating business logic (Laravel Service Layer) from the presentation layer (React Components). Deployment and environment configuration were managed via Render to ensure a scalable production environment.

---

## 📋 License

This project is open-sourced software licensed under the MIT license.
