# UDBHAVA Enterprise - E-Commerce Platform

A robust, full-stack e-commerce application built with **Node.js, Express, MongoDB**, and a **Vanilla JavaScript** frontend. This project features a modern responsive UI, secure authentication, dynamic cart/checkout, and a comprehensive Admin Dashboard.

## 🚀 Features

### 🛍️ Customer Experience
- **Responsive Shop UI**: Browser products by category (Sarees, Men's Wear, Decor, etc.) with filtering.
- **Dynamic Cart**: Server-managed cart persists across logins.
- **Secure Authentication**: Register/Login with HttpOnly Cookies (JWT).
- **Checkout**:
  - Multiple Payment Methods: Card, **UPI (Dynamic QR Code)**, Cash on Delivery.
  - Address Management.
- **Order History**: View past orders and status.
- **Stock Warnings**: Visual "Only X left!" alerts for low-density items.

### 👨‍💻 Admin Dashboard
- **Admin Dashboard**:
  - Detailed Stats (Revenue, Orders, Low Stock).
  - **New:** Advanced Analytics (Sales by Month/Year/Quarter).
  - **New:** Export Reports to **PDF** and **Excel**.
  - Inventory Management (Edit/Add Products).
  - Order Management (View Details, Status).

## 🛠️ Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Authentication**: JSON Web Tokens (JWT) via HttpOnly Cookies
- **Images**: Hosted URLs (configured in database)
- **Emails**: Nodemailer (Order confirmations)

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository_url>
    cd pride-pt-2-project
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    cd server
    npm install
    cd ..
    ```

3.  **Environment Configuration**
    Create a `.env` file in the `server/` directory:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/pride_db
    JWT_SECRET=your_super_secret_key_123
    NODE_ENV=development
    
    # Optional: For Email Notifications
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    ```

4.  **Seed the Database (Optional)**
    To create default products and the **Admin User**:
    ```bash
    node server/seed.js
    ```

5.  **Run the Application**
    ```bash
    # Run server with Nodemon (Auto-restart)
    npm run dev
    ```
    Access the app at: `http://localhost:3000`

## 🔑 Default Credentials

**Admin Account** (Created by `seed.js`):
- **Email:** `admin@example.com`
- **Password:** `password123`

## 📂 Project Structure

```
├── public/              # Frontend Static Files
│   ├── css/             # Styles (shop.css, admin.css, cart.css)
│   ├── js/              # Logic (auth.js, shop.js, admin.js, etc.)
│   ├── admin.html       # Admin Dashboard
│   ├── shop.html        # Main Storefront
│   └── ...
├── server/              # Backend API
│   ├── config/          # DB Connection
│   ├── controllers/     # Business Logic (Order, Product, Admin)
│   ├── middleware/      # Auth & Error Handling
│   ├── models/          # Mongoose Schemas (User, Product, Order)
│   ├── routes/          # API Routes
│   ├── server.js        # App Entry Point
│   └── seed.js          # Database Seeder
└── package.json
```

## 📝 API Documentation (Brief)

- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- **Products**: `GET /api/products`, `POST /api/products` (Admin), `PUT /api/products/:id` (Admin)
- **Cart**: `GET /api/cart`, `POST /api/cart/add`, `PUT /api/cart/update`
- **Orders**: `POST /api/orders`, `GET /api/orders` (Admin), `GET /api/orders/myorders`
- **Admin**: `GET /api/admin/stats`

---
*Built for Udbhava Enterprise.*
