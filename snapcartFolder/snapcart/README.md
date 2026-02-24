# 🛒 SnapCart

**SnapCart** is a full-stack, real-time grocery delivery e-commerce application built with **Next.js 16**, **MongoDB**, **Socket.IO**, and **Stripe**. It supports three distinct roles — **User**, **Admin**, and **Delivery Boy** — each with a dedicated dashboard and workflow. The platform handles everything from product browsing and cart management to live order tracking, real-time chat, OTP-based delivery confirmation, and AI-powered suggestions.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?logo=stripe)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?logo=socket.io)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-blue?logo=tailwindcss)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Database Models](#-database-models)
- [API Endpoints](#-api-endpoints)
- [Socket.IO Events](#-socketio-events)
- [Authentication](#-authentication)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)

---

## ✨ Features

### 👤 User Features
- **Authentication** — Secure login and registration using NextAuth.js v5 with Credentials (email + password) and Google OAuth providers.
- **Browse Products** — View grocery items organized by categories (Fruits & Vegetables, Dairy, Snacks, Beverages, etc.) with a category slider for quick navigation.
- **Shopping Cart** — Add/remove/update item quantities, persisted in Redux state.
- **Checkout** — Provide delivery address with an interactive Leaflet map for precise latitude/longitude selection via geocoding search.
- **Payment Options** — Choose between **Cash on Delivery (COD)** or **Online Payment via Stripe** (card payments using Stripe Elements).
- **Order Tracking** — View live order status (pending → out of delivery → delivered) with a live map showing the delivery boy's real-time GPS location.
- **In-App Chat** — Real-time chat between the user and delivery boy for a specific order, powered by Socket.IO rooms.
- **AI Suggestions** — Get AI-powered grocery suggestions via the `/api/chat/ai-suggestions` endpoint.
- **Order History** — Browse past orders with full item details, status, and payment info.
- **OTP Verification** — Delivery is confirmed by an OTP sent to the user; the delivery boy must enter the OTP to mark the order as delivered.

### 🔧 Admin Features
- **Add Grocery Items** — Upload products with name, category, price, unit, and image (uploaded to Cloudinary).
- **View Grocery Items** — Browse and manage all listed grocery products.
- **Edit / Delete Grocery** — Update product details or remove items from the catalog.
- **Manage Orders** — View all orders across all users with full details.
- **Update Order Status** — Manually change order status and trigger delivery assignment broadcast.
- **Delivery Boy Assignment** — When an order moves to "out of delivery", the system broadcasts the order to available online delivery boys via Socket.IO.

### 🚴 Delivery Boy Features
- **Dashboard** — View orders assigned to them, accept incoming delivery requests.
- **Real-Time Location Tracking** — Continuously emit GPS coordinates via Socket.IO so users can track delivery on a live map.
- **OTP Confirmation** — Enter the OTP provided by the customer to confirm delivery and mark the order as completed.
- **Chat** — Real-time chat with the customer for the ongoing delivery order.
- **Role Management** — Users can request role change to delivery boy via the mobile edit-role flow.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16.1.1 (App Router) | Full-stack React framework with SSR/SSG |
| **Frontend** | React 19, TailwindCSS 4 | UI rendering and styling |
| **State Management** | Redux Toolkit, React-Redux | Global cart and user state |
| **Database** | MongoDB with Mongoose ODM | Persistent data storage |
| **Authentication** | NextAuth.js v5 (Beta) | Session management, Credentials + Google OAuth |
| **Real-Time** | Socket.IO (client + standalone server) | Live location, chat, order broadcast |
| **Payments** | Stripe | Online card payments and webhooks |
| **Image Upload** | Cloudinary | Cloud-based image hosting for products |
| **Maps** | Leaflet, React-Leaflet, Leaflet-Geosearch | Interactive maps, geocoding, live tracking |
| **Charts** | Recharts | Admin dashboard analytics |
| **Animations** | Motion (Framer Motion) | Smooth UI transitions |
| **Email** | Nodemailer | Transactional email (OTP, notifications) |
| **Password Hashing** | bcryptjs | Secure password storage |
| **HTTP Client** | Axios | API calls between services |
| **Language** | TypeScript | Type-safe development |

---

## 🏗️ Architecture Overview

SnapCart is composed of **two separate services** that run together:

```
┌────────────────────────────────────────────────┐
│            Next.js App (Port 3000)             │
│  ┌──────────┐  ┌───────────┐  ┌────────────┐  │
│  │  Pages   │  │ API Routes│  │  NextAuth  │  │
│  │ (App     │  │ (/api/*)  │  │  (Session) │  │
│  │  Router) │  └─────┬─────┘  └────────────┘  │
│  └──────────┘        │                         │
└─────────────────────────────────────────────────┘
                        │ HTTP (Axios)
                        ▼
┌────────────────────────────────────────────────┐
│         Socket.IO Server (Port 5000)           │
│  ┌──────────────────────────────────────────┐  │
│  │  Express + Socket.IO                     │  │
│  │  - identity registration                 │  │
│  │  - update-location (GPS)                 │  │
│  │  - join-room / send-message (chat)       │  │
│  │  - /notify HTTP endpoint                 │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────┐
│            MongoDB (Atlas / local)             │
│  Users | Orders | Groceries | Messages |       │
│  DeliveryAssignments                           │
└────────────────────────────────────────────────┘
```

- The **Next.js app** handles all page rendering, API routes, authentication, and database operations.
- The **Socket.IO server** (a separate Node.js/Express app in `/socketServer`) manages all real-time events: location updates, chat, and delivery broadcast notifications. It communicates back to the Next.js app via HTTP using its `/notify` endpoint.
- Both services share the same **MongoDB** database.

---

## 📁 Project Structure

```
snapcartFolder/
├── snapcart/                        # Next.js application
│   ├── src/
│   │   ├── auth.ts                  # NextAuth.js config (Credentials + Google)
│   │   ├── Provider.tsx             # Session & Redux providers wrapper
│   │   ├── InitUser.tsx             # Initializes user into Redux from session
│   │   ├── proxy.ts                 # Utility proxy helpers
│   │   ├── global.d.ts              # Global TypeScript declarations
│   │   ├── next-auth.d.ts           # NextAuth session type augmentation
│   │   │
│   │   ├── app/
│   │   │   ├── globals.css          # Global TailwindCSS styles
│   │   │   ├── layout.tsx           # Root layout with providers
│   │   │   ├── page.tsx             # Landing/home page
│   │   │   │
│   │   │   ├── login/page.tsx       # Login page
│   │   │   ├── register/page.tsx    # Registration page
│   │   │   ├── unauthorized/page.tsx# Access denied page
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── add-grocery/page.tsx     # Admin: add new product
│   │   │   │   ├── view-grocery/page.tsx    # Admin: view/manage products
│   │   │   │   └── manage-order/page.tsx    # Admin: view/update orders
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── cart/page.tsx            # Shopping cart
│   │   │   │   ├── checkout/page.tsx        # Checkout with map
│   │   │   │   ├── my-orders/page.tsx       # Order history
│   │   │   │   ├── order-success/           # Post-payment confirmation
│   │   │   │   └── track-order/             # Live order/delivery tracking
│   │   │   │
│   │   │   └── api/
│   │   │       ├── auth/
│   │   │       │   ├── [...nextauth]/       # NextAuth handler
│   │   │       │   └── register/            # Custom user registration
│   │   │       ├── me/route.ts              # Get current authenticated user
│   │   │       ├── check-for-admin/route.ts # Middleware-style admin check
│   │   │       ├── admin/
│   │   │       │   ├── add-grocery/         # POST: add grocery item
│   │   │       │   ├── edit-grocery/        # PUT: edit grocery item
│   │   │       │   ├── delete-grocery/      # DELETE: remove grocery item
│   │   │       │   ├── get-groceries/       # GET: all grocery items
│   │   │       │   ├── get-orders/          # GET: all orders (admin)
│   │   │       │   └── update-order-status/ # PATCH: change order status
│   │   │       ├── user/
│   │   │       │   ├── order/               # POST: create new order
│   │   │       │   ├── my-orders/           # GET: current user's orders
│   │   │       │   ├── get-order/           # GET: single order by ID
│   │   │       │   ├── payment/             # POST: Stripe payment intent
│   │   │       │   ├── stripe/              # POST: Stripe webhook handler
│   │   │       │   └── edit-role-mobile/    # PATCH: change user role
│   │   │       ├── chat/
│   │   │       │   ├── messages/            # GET: fetch chat messages for order
│   │   │       │   ├── save/                # POST: save a chat message
│   │   │       │   └── ai-suggestions/      # POST: AI grocery suggestions
│   │   │       ├── delivery/
│   │   │       │   ├── assignment/          # POST/GET: manage delivery assignments
│   │   │       │   ├── get-assignments/     # GET: assignments for a delivery boy
│   │   │       │   ├── current-order/       # GET: active order for delivery boy
│   │   │       │   └── otp/                 # POST: verify delivery OTP
│   │   │       └── socket/
│   │   │           ├── connect/             # POST: store socketId for user
│   │   │           └── update-location/     # POST: update delivery boy GPS coords
│   │   │
│   │   ├── components/
│   │   │   ├── Nav.tsx                      # Navigation bar
│   │   │   ├── HeroSection.tsx              # Landing page hero
│   │   │   ├── CategorySlider.tsx           # Horizontal category scroll
│   │   │   ├── GroceryItemCard.tsx          # Product card component
│   │   │   ├── UserDashboard.tsx            # User home dashboard
│   │   │   ├── UserOrderCard.tsx            # Single order card for users
│   │   │   ├── AdminDashboard.tsx           # Admin panel (SSR)
│   │   │   ├── AdminDashboardClient.tsx     # Admin panel (client interactions)
│   │   │   ├── AdminOrderCard.tsx           # Single order card for admin
│   │   │   ├── CheckoutMap.tsx              # Leaflet map for address selection
│   │   │   ├── LiveMap.tsx                  # Real-time delivery tracking map
│   │   │   ├── GeoUpdater.tsx               # Emits GPS via Socket.IO (delivery boy)
│   │   │   ├── DeliveryBoy.tsx              # Delivery boy UI/logic
│   │   │   ├── DeliveryBoyDashboard.tsx     # Delivery boy dashboard
│   │   │   ├── DeliveryChat.tsx             # Real-time chat component
│   │   │   ├── EditRoleMobile.tsx           # Mobile role-change UI
│   │   │   ├── RegisterForm.tsx             # Registration form
│   │   │   ├── Welcome.tsx                  # Welcome/onboarding component
│   │   │   └── footer.tsx                   # Footer component
│   │   │
│   │   ├── hooks/
│   │   │   └── useGetMe.tsx                 # Custom hook to fetch & store current user
│   │   │
│   │   ├── lib/
│   │   │   ├── db.ts                        # MongoDB/Mongoose connection utility
│   │   │   ├── cloudinary.ts                # Cloudinary SDK configuration
│   │   │   ├── mailer.ts                    # Nodemailer email sending utility
│   │   │   ├── socket.ts                    # Socket.IO client singleton
│   │   │   └── emitEventHandler.ts          # Helper to emit events via the socket server
│   │   │
│   │   ├── models/
│   │   │   ├── user.model.ts                # User schema (roles, location, socketId)
│   │   │   ├── grocery.model.ts             # Grocery/product schema
│   │   │   ├── order.model.ts               # Order schema (items, address, OTP)
│   │   │   ├── message.model.ts             # Chat message schema
│   │   │   └── deliveryAssignment.model.ts  # Delivery assignment schema
│   │   │
│   │   └── redux/
│   │       ├── store.ts                     # Redux store configuration
│   │       ├── StoreProvider.tsx            # Redux Provider wrapper
│   │       ├── cartSlice.ts                 # Cart state slice (add/remove/update)
│   │       └── userSlice.ts                 # User state slice (current user info)
│   │
│   ├── public/                              # Static assets
│   ├── next.config.ts                       # Next.js configuration
│   ├── tsconfig.json                        # TypeScript configuration
│   ├── eslint.config.mjs                    # ESLint configuration
│   └── postcss.config.mjs                   # PostCSS/Tailwind configuration
│
└── socketServer/                            # Standalone Socket.IO server
    ├── index.js                             # Express + Socket.IO server entry point
    └── package.json                         # Socket server dependencies
```

---

## 🗃️ Database Models

### User
| Field | Type | Description |
|---|---|---|
| `name` | String | Full name |
| `email` | String | Unique email address |
| `password` | String | Bcrypt-hashed password (optional for OAuth) |
| `mobile` | String | Phone number |
| `role` | Enum | `user` \| `admin` \| `deliveryBoy` |
| `image` | String | Profile picture URL |
| `location` | GeoJSON Point | Real-time GPS coordinates (2dsphere index) |
| `socketId` | String | Active Socket.IO connection ID |
| `isOnline` | Boolean | Whether delivery boy is currently online |

### Grocery
| Field | Type | Description |
|---|---|---|
| `name` | String | Product name |
| `category` | Enum | One of 10 predefined categories |
| `price` | Number | Price in currency |
| `unit` | Enum | `kg` \| `g` \| `litre` \| `ml` \| `piece` \| `pack` |
| `image` | String | Cloudinary image URL |

### Order
| Field | Type | Description |
|---|---|---|
| `user` | ObjectId → User | Order owner |
| `items` | Array | Grocery items with name, price, unit, image, quantity |
| `totalAmount` | Number | Total order value |
| `paymentMethod` | Enum | `cod` \| `online` |
| `isPaid` | Boolean | Stripe payment confirmation |
| `address` | Object | fullName, mobile, city, state, pincode, fullAddress, lat/lng |
| `status` | Enum | `pending` \| `out of delivery` \| `delivered` |
| `assignedDeliveryBoy` | ObjectId → User | Assigned delivery person |
| `deliveryOtp` | String | One-time password for delivery confirmation |
| `deliveryOtpVerification` | Boolean | OTP verified flag |
| `deliveredAt` | Date | Timestamp of delivery |

### DeliveryAssignment
| Field | Type | Description |
|---|---|---|
| `order` | ObjectId → Order | Related order |
| `broadcastedTo` | ObjectId[] | Delivery boys who received the broadcast |
| `assignedTo` | ObjectId → User | Who accepted the delivery |
| `status` | Enum | `broadcasted` \| `assigned` \| `completed` |
| `acceptedAt` | Date | When delivery boy accepted |

### Message
Stores chat messages exchanged between user and delivery boy per order room.

---

## 📝 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user with email & password |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth.js handler (login, OAuth callback) |
| GET | `/api/me` | Get the currently authenticated user's data |
| GET | `/api/check-for-admin` | Verify if the current session user is an admin |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/add-grocery` | Add a new grocery product (with Cloudinary image upload) |
| PUT | `/api/admin/edit-grocery` | Edit an existing grocery product |
| DELETE | `/api/admin/delete-grocery` | Delete a grocery product |
| GET | `/api/admin/get-groceries` | Fetch all grocery items |
| GET | `/api/admin/get-orders` | Fetch all orders (admin view) |
| PATCH | `/api/admin/update-order-status` | Update order status; triggers delivery broadcast on "out of delivery" |

### User
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/user/order` | Place a new order (COD or online) |
| GET | `/api/user/my-orders` | Get the authenticated user's order history |
| GET | `/api/user/get-order` | Get a single order by ID |
| POST | `/api/user/payment` | Create a Stripe PaymentIntent for online payment |
| POST | `/api/user/stripe` | Stripe webhook for payment confirmation |
| PATCH | `/api/user/edit-role-mobile` | Update the user's role (e.g., become a delivery boy) |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chat/messages` | Fetch all messages for a specific order room |
| POST | `/api/chat/save` | Persist a chat message to MongoDB |
| POST | `/api/chat/ai-suggestions` | Get AI-generated grocery suggestions |

### Delivery
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/delivery/assignment` | Accept a delivery assignment (delivery boy) |
| GET | `/api/delivery/get-assignments` | Get all pending assignments for a delivery boy |
| GET | `/api/delivery/current-order` | Get the active order assigned to a delivery boy |
| POST | `/api/delivery/otp` | Verify the delivery OTP to mark order as delivered |

### Socket Bridge
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/socket/connect` | Store a user's Socket.IO `socketId` in the database |
| POST | `/api/socket/update-location` | Update a delivery boy's GPS location in MongoDB |

---

## ⚡ Socket.IO Events

The standalone Socket.IO server (`socketServer/`) manages all real-time communication.

### Client → Server Events
| Event | Payload | Description |
|---|---|---|
| `identity` | `userId` | Register socket connection; stores socketId via Next.js API |
| `update-location` | `{ userId, latitude, longitude }` | Delivery boy emits live GPS position |
| `join-room` | `roomId` (orderId) | User/delivery boy joins an order-specific chat room |
| `send-message` | `{ roomId, text, senderId, time }` | Send a chat message; saved to DB and broadcast to room |

### Server → Client Events
| Event | Payload | Description |
|---|---|---|
| `update-deliveryBoy-location` | `{ userId, location }` | Broadcast updated delivery boy location to all clients |
| `send-message` | message object | Deliver incoming chat message to room members |
| `*` (custom) | any | `/notify` HTTP endpoint emits any custom event to a specific socket or all clients |

### `/notify` HTTP Endpoint (Socket Server Port 5000)
The Next.js app can trigger real-time events by calling `POST http://localhost:5000/notify` with:
```json
{
  "event": "event-name",
  "data": {},
  "socketId": "optional-socket-id"
}
```
If `socketId` is omitted, the event is broadcast to all connected clients. This is used to notify delivery boys of new delivery assignments.

---

## 🔐 Authentication

SnapCart uses **NextAuth.js v5** configured in `src/auth.ts` with two providers:

1. **Credentials Provider** — Users register with email + hashed password (bcryptjs). Login validates credentials against MongoDB.
2. **Google OAuth** — Users can sign in with Google. On first login, an account is automatically created in MongoDB.

The session carries `id`, `email`, `name`, and `role` fields. Role is used throughout the app to gate access to admin and delivery boy routes. The `next-auth.d.ts` file augments the default session types to include `role` and `id`.

---

## 🌍 Environment Variables

### Next.js App (`snapcart/.env.local`)

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
AUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key

# Socket Server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Socket.IO Server (`socketServer/.env`)

```env
PORT=5000
NEXT_BASE_URL=http://localhost:3000
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Cloudinary** account
- **Stripe** account
- **Google Cloud** credentials (for OAuth)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/snapcart.git
cd snapcart
```

### 2. Set Up the Next.js App

```bash
cd snapcart
npm install
# Create .env.local and fill in all variables listed above
npm run dev
```

The Next.js app runs on [http://localhost:3000](http://localhost:3000).

### 3. Set Up the Socket.IO Server

```bash
cd socketServer
npm install
# Create .env and fill in PORT and NEXT_BASE_URL
npm run dev
```

The Socket.IO server runs on [http://localhost:5000](http://localhost:5000).

### 4. Build for Production

```bash
# Next.js app
cd snapcart
npm run build
npm start

# Socket server
cd socketServer
node index.js
```

---

## 🚢 Deployment

| Service | Recommended Platform |
|---|---|
| Next.js App | [Vercel](https://vercel.com) |
| Socket.IO Server | [Railway](https://railway.app), [Render](https://render.com), or any Node.js host |
| MongoDB | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| Images | [Cloudinary](https://cloudinary.com) (managed automatically) |

> **Important:** After deploying, update `NEXT_BASE_URL` in the socket server to your production Next.js URL, and update `NEXT_PUBLIC_SOCKET_URL` in the Next.js app to your deployed socket server URL.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

Made with ❤️ using Next.js, Socket.IO, and MongoDB
