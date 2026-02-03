# 🛒 SnapCart

A full-stack grocery delivery e-commerce application built with Next.js 16, featuring user authentication, shopping cart, order management, Stripe payments, and an admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?logo=stripe)

## ✨ Features

### 👤 User Features
- **Authentication** - Secure login/register with NextAuth.js
- **Browse Products** - View grocery items by categories
- **Shopping Cart** - Add/remove items with Redux state management
- **Checkout** - Address selection with map integration (Leaflet)
- **Payment Options** - Cash on Delivery (COD) or Online Payment (Stripe)
- **Order Tracking** - View order history and status

### 🔧 Admin Features
- **Add Grocery Items** - Upload products with images (Cloudinary)
- **Manage Orders** - View all orders and update delivery status
- **Order Status Updates** - Mark orders as pending, out of delivery, or delivered

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16.1.1 (App Router) |
| **Frontend** | React 19, TailwindCSS 4 |
| **State Management** | Redux Toolkit, React-Redux |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | NextAuth.js v5 (Beta) |
| **Payments** | Stripe |
| **Image Upload** | Cloudinary |
| **Maps** | Leaflet, React-Leaflet, Leaflet-Geosearch |
| **Animations** | Motion (Framer Motion) |
| **Icons** | Lucide React |
| **Language** | TypeScript |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin pages (add grocery, manage orders)
│   ├── api/                # API routes
│   │   ├── admin/          # Admin APIs
│   │   ├── auth/           # Authentication APIs
│   │   └── user/           # User APIs (orders, payments)
│   ├── login/              # Login page
│   ├── register/           # Register page
│   └── user/               # User pages (cart, checkout, orders)
├── components/             # Reusable React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries (DB, Cloudinary)
├── models/                 # Mongoose models
└── redux/                  # Redux store and slices
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Cloudinary account
- Stripe account

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
AUTH_SECRET=your_nextauth_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/snapcart.git

# Navigate to project directory
cd snapcart

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| GET | `/api/me` | Get current user |
| POST | `/api/admin/add-grocery` | Add new grocery item |
| GET | `/api/admin/get-orders` | Get all orders (admin) |
| POST | `/api/user/order` | Create new order |
| GET | `/api/user/my-orders` | Get user's orders |
| POST | `/api/user/payment` | Create Stripe payment intent |
| POST | `/api/user/stripe/webhook` | Stripe webhook handler |

## 🎨 Screenshots

*Add screenshots of your application here*

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Made with ❤️ using Next.js

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
