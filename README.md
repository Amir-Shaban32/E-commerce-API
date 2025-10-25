# 🛒 E-Commerce API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)

**A production-ready RESTful API for modern e-commerce applications**

[Features](#-features) • [Quick Start](#-quick-start) • [API Docs](#-api-documentation) • [Development](#-development)

</div>

---

## 🌟 Features

### Core Functionality
- 🔐 **Authentication** - JWT with refresh tokens + Google OAuth
- 🛍️ **Products** - CRUD with filtering, sorting & pagination
- 🗂️ **Categories** - Hierarchical organization
- 🛒 **Shopping Cart** - Persistent with real-time calculations
- 📦 **Orders** - Complete lifecycle with status tracking
- 💳 **Payments** - Stripe integration with webhooks
- 👥 **Users** - Profile management with RBAC

### Technical Highlights
- 🔄 **MongoDB Transactions** - ACID compliance • 🎭 **Role-Based Access** - Admin/User/Guest
- 🗑️ **Soft Deletes** - Audit trails • ✅ **Zod Validation** - Type-safe schemas
- 🔒 **Ownership Checks** - Resource protection • 📊 **AdminJS Dashboard** - Built-in panel
- 📝 **Swagger Docs** - Interactive API explorer

---

## 🚀 Quick Start

### Prerequisites
- [Node.js 18+](https://nodejs.org/en/download) • [pnpm](https://pnpm.io/installation) • [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) **(required for transactions)**

### Installation

```bash
# Clone and install
git clone https://github.com/Amir-Shaban32/E-commerce-API
cd "e-commerce API"
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### Environment Variables

```env
# Server & Database
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# JWT Secrets (use strong random strings)
ACCESS_SECRET_KEY=your_super_secure_access_secret_key
REFRESH_SECRET_KEY=your_super_secure_refresh_secret_key

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
WEBHOOK_SECRET_KEY=whsec_your_webhook_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
SESSION_SECRET=your_session_secret_key
COOKIE_SECRET=your_cookie_secret_key

# Admin Panel
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_admin_password
```

### Run

```bash
pnpm dev          # Development with hot reload
pnpm build        # Compile TypeScript
pnpm start        # Production mode
```

**Access Points:**
- API Documentation: `http://localhost:3000/api-docs`
- Admin Dashboard: `http://localhost:3000/admin`

---

## 🏗️ Architecture

### Tech Stack
**Runtime:** Node.js 18+ • **Language:** TypeScript 5.9 • **Framework:** Express.js 5.1  
**Database:** MongoDB 8.19 (Atlas) • **ODM:** Mongoose • **Validation:** Zod 4.1  
**Auth:** JWT + Passport.js • **Payment:** Stripe 19.1 • **Docs:** Swagger UI • **Admin:** AdminJS 7.8

### Project Structure
```
src/
├── config/         # DB, Passport strategies, RBAC
├── models/         # Mongoose schemas with transactions
├── controllers/    # Request handlers
├── services/       # Business logic
├── routes/         # API & auth routes
├── middlewares/    # Auth, RBAC, ownership checks
├── validation/     # Zod schemas
└── utils/          # Helpers
```

---

## 🛠️ Development

### Scripts
```bash
pnpm dev          # Start dev server with hot reload
pnpm build        # Compile TypeScript
pnpm start        # Run production build
pnpm clean        # Remove build artifacts
pnpm tree         # Generate project structure (requires tree)
```

### Stripe Webhooks (Development)
1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Forward events: `stripe listen --forward-to localhost:3000/api/webhook`
3. Add webhook secret to `.env`
4. Test events:
```bash
stripe trigger payment_intent.succeeded
stripe trigger charge.refunded
stripe trigger payment_intent.payment_failed
```

---

## 📦 Key Dependencies

**Production:** express • mongoose • jsonwebtoken • bcrypt • zod • stripe • passport • passport-google-oauth20 • adminjs • @adminjs/express • swagger-ui-express • cookie-parser • dotenv

**Development:** typescript • tsx • @types/*

---

## 👤 Author

**Amir Shaban**  
- GitHub: [Amir-Shaban32](https://github.com/Amir-Shaban32) 
- LinkedIn: [Amir-Shaban](https://linkedin.com/in/amir-shaban)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made by Amir Shaban

</div>