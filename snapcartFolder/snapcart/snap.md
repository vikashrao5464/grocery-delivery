# SnapCart — Full-Stack Grocery Delivery Platform

## Project Links

- **GitHub:** https://github.com/vikashrao5464/grocery-delivery
- **Live Demo:** Add the deployed SnapCart URL here
- **Development Period:** December 2025 – February 2026

---

## Project Overview

SnapCart is a full-stack, real-time grocery delivery application that manages the complete lifecycle of an online grocery order—from product discovery and checkout to delivery-partner assignment, live location tracking, customer communication, and OTP-based delivery confirmation.

The platform supports three role-based experiences:

1. **Customer:** Browses groceries, manages a cart, places orders, makes payments, tracks deliveries, and chats with the assigned delivery partner.
2. **Administrator:** Manages products and orders, monitors platform statistics, and initiates delivery assignments.
3. **Delivery Partner:** Receives nearby delivery requests, accepts an assignment, shares live location, communicates with the customer, and completes delivery using OTP verification.

SnapCart uses a Next.js application for the frontend, server-rendered pages, authentication, and REST APIs. A separate Express.js and Socket.IO server manages long-lived real-time connections. MongoDB stores users, groceries, orders, delivery assignments, and chat history.

---

## Problem Statement

Traditional e-commerce applications generally stop after creating an order. A grocery delivery platform must also coordinate administrators, customers, and delivery partners in real time.

SnapCart addresses the following requirements:

- Secure customer registration and login
- Separate customer, administrator, and delivery-partner workflows
- Centralized cart and pricing management
- Online and cash-on-delivery payment options
- Accurate address selection using maps and reverse geocoding
- Nearby delivery-partner discovery based on geographic coordinates
- Real-time assignment and order-status notifications
- Live delivery-partner location tracking
- Persistent order-specific chat
- AI-generated contextual chat replies
- Customer-confirmed delivery through a one-time password

---

## Key Highlights

- Supports **3 role-based workflows**: customer, administrator, and delivery partner
- Implements **20+ REST API endpoints** across authentication, products, orders, delivery, chat, payments, and sockets
- Uses **5 MongoDB models** for users, groceries, orders, assignments, and messages
- Implements **6+ custom Socket.IO events** for real-time application updates
- Discovers available delivery partners within a **10 km radius** using MongoDB geospatial queries
- Supports **2 payment methods**: Stripe Checkout and cash on delivery
- Generates a **4-digit OTP** for customer-confirmed delivery
- Produces **3 contextual AI reply suggestions** per request
- Supports **10 grocery categories** and multiple product units

---

## Technology Stack

### Frontend

| Technology | Usage |
|---|---|
| Next.js 16 | Application framework, App Router, server components, routing, and API routes |
| React 19 | Component-based user-interface development |
| TypeScript | Static typing for components, APIs, state, and data structures |
| Redux Toolkit | Global customer and shopping-cart state management |
| React Redux | Connects React components to the Redux store |
| Tailwind CSS 4 | Responsive styling and reusable utility classes |
| Motion / Framer Motion | Page, card, modal, and interaction animations |
| Lucide React | Interface icons |
| Axios | Client-to-server and service-to-service HTTP requests |

### Backend

| Technology | Usage |
|---|---|
| Next.js Route Handlers | REST APIs for authentication, products, orders, delivery, chat, and payments |
| Node.js | JavaScript server runtime |
| Express.js | Standalone HTTP server for the real-time service |
| Socket.IO | Bidirectional communication, chat, assignments, notifications, and location updates |
| NextAuth | Credentials and Google OAuth authentication with JWT sessions |
| bcryptjs | Password hashing and password verification |

### Database and Storage

| Technology | Usage |
|---|---|
| MongoDB | Main application database |
| Mongoose | Schema definitions, validation, queries, population, and indexes |
| MongoDB GeoJSON | Stores delivery-partner coordinates |
| MongoDB 2dsphere index | Enables proximity-based delivery-partner searches |
| Cloudinary | Stores grocery images and returns secure image URLs |

### Payments, Maps, AI, and Communication

| Technology | Usage |
|---|---|
| Stripe Checkout | Hosted online card-payment flow |
| Stripe Webhooks | Server-side payment confirmation |
| Leaflet / React Leaflet | Checkout location selection and live delivery map |
| OpenStreetMap | Map tiles |
| Nominatim | Reverse geocoding from coordinates to an address |
| Gemini API | Role-aware contextual chat suggestions |
| Nodemailer | Sends delivery OTP emails |

### Deployment

| Service | Deployment responsibility |
|---|---|
| Vercel | Next.js frontend and REST API routes |
| Render | Persistent Express.js and Socket.IO server |
| MongoDB Atlas | Cloud-hosted application database |
| Cloudinary | Managed grocery image storage |

---

## High-Level Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│  Customer UI | Admin UI | Delivery Partner UI           │
│  Redux | Leaflet | Socket.IO Client                      │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTPS
                        ▼
┌──────────────────────────────────────────────────────────┐
│             Next.js Application — Vercel                │
│                                                          │
│  App Router Pages | Server Components | NextAuth         │
│  REST API Routes  | Stripe | Gemini | Cloudinary         │
│  Nodemailer       | Mongoose                             │
└───────────────┬──────────────────────┬───────────────────┘
                │                      │ HTTP /notify
                │ MongoDB              ▼
                │       ┌──────────────────────────────────┐
                │       │ Express + Socket.IO — Render     │
                │       │                                  │
                │       │ Identity | Rooms | Chat          │
                │       │ GPS Updates | Notifications      │
                │       └──────────────────────────────────┘
                ▼
┌──────────────────────────────────────────────────────────┐
│                     MongoDB Atlas                        │
│ Users | Groceries | Orders | Assignments | Messages      │
└──────────────────────────────────────────────────────────┘
```

The Next.js and Socket.IO services are deployed separately because Vercel is suitable for the frontend and stateless API operations, while Socket.IO requires a persistent Node.js process for long-lived WebSocket connections.

---

## Complete Application Flow

```text
Visitor opens SnapCart
          │
          ▼
Welcome page → Login or Register
          │
          ▼
NextAuth authenticates user
          │
          ▼
Role-based dashboard selected
          │
     ┌────┴───────────────┐
     │                    │
 Customer             Administrator
     │                    │
Browse groceries      Manage products/orders
     │                    │
Add to Redux cart     Set order out for delivery
     │                    │
Checkout + map             │
     │                    ▼
COD or Stripe       Find partners within 10 km
     │                    │
Order created       Broadcast assignment request
     │                    │
     └──────────────┬─────┘
                    ▼
          Delivery partner accepts
                    │
                    ▼
     Live GPS tracking + order chat
                    │
                    ▼
            OTP sent to customer
                    │
                    ▼
              OTP verification
                    │
                    ▼
          Order and assignment completed
```

---

## Authentication Flow

SnapCart supports credentials authentication and Google OAuth through NextAuth.

### Credentials Registration and Login

1. The visitor submits a name, email, and password.
2. The API verifies that the email is not already registered.
3. The password must contain at least six characters.
4. bcrypt hashes the password using ten salt rounds.
5. MongoDB stores the account with the hashed password.
6. During login, bcrypt compares the submitted password with the stored hash.
7. NextAuth creates a JWT-based session after successful authentication.
8. The token and session include the user's ID, name, email, and role.

### Google OAuth Flow

1. The visitor authenticates through Google.
2. The sign-in callback searches MongoDB using the Google email address.
3. A new database user is created when the email is not registered.
4. The MongoDB user ID and role are added to the NextAuth token.

### Role-Based Access

The application recognizes these roles:

- `user`
- `admin`
- `deliveryBoy`

The Next.js proxy checks the session before allowing access to protected pages. It prevents customers from opening administrator routes and prevents other roles from opening customer or delivery-partner routes.

---

## Customer Flow

### 1. Product Discovery

- The customer dashboard loads groceries from MongoDB.
- Products can be searched by name or category.
- A category slider provides quick navigation among grocery groups.
- Each grocery card shows its image, name, category, price, and unit.

### 2. Cart Management

Redux Toolkit stores the cart globally so that product cards, navigation, cart, and checkout pages share consistent data.

The cart supports:

- Adding groceries
- Increasing quantities
- Decreasing quantities
- Removing groceries
- Calculating the subtotal
- Calculating the delivery fee
- Calculating the final total

The default delivery fee is ₹40 and becomes free when the subtotal exceeds ₹100.

### 3. Address and Location Selection

1. The customer opens checkout.
2. The browser can provide the current coordinates.
3. The customer can select or adjust the location on a Leaflet map.
4. The selected coordinates are sent to Nominatim.
5. Reverse geocoding converts the coordinates into readable address details.
6. SnapCart stores both the text address and coordinates with the order.

### 4. Order Placement

The customer chooses one of two payment methods:

- Cash on delivery
- Online payment through Stripe Checkout

After order creation, the API emits a `new-order` event so the administrator dashboard can update without a manual refresh.

### 5. Order History and Tracking

Customers can view:

- Purchased items and quantities
- Total amount
- Payment method and payment status
- Delivery address
- Assigned delivery partner
- Current order status
- Creation date

When an order has an assigned delivery partner, the customer can open the tracking page to view the live map and order-specific chat.

---

## Administrator Flow

### Dashboard Analytics

The administrator dashboard calculates:

- Total orders
- Total customers
- Pending deliveries
- Total revenue
- Today's revenue
- Revenue from the previous seven days
- Chart-ready daily order and revenue data

### Grocery Management

Administrators can:

- Add a grocery
- Select one of ten supported categories
- Set its price and unit
- Upload its image to Cloudinary
- Search existing groceries
- Edit grocery information
- Delete a grocery

Images are sent as multipart form data. The backend converts the uploaded Blob to a buffer, streams it to Cloudinary, and stores the returned secure URL in MongoDB.

### Order Management

Administrators can view all orders and change their statuses:

- `pending`
- `out of delivery`
- `delivered`

Changing an order to `out of delivery` starts the delivery-assignment workflow.

---

## Delivery Assignment Flow

```text
Admin selects "out of delivery"
              │
              ▼
Read destination latitude/longitude
              │
              ▼
MongoDB $near query on 2dsphere index
              │
              ▼
Find delivery partners within 10,000 metres
              │
              ▼
Find partners with active assignments
              │
              ▼
Remove busy partners from candidate list
              │
              ▼
Create DeliveryAssignment as "broadcasted"
              │
              ▼
Send targeted new-assignment socket events
              │
              ▼
Delivery partner accepts assignment
              │
              ▼
Assignment → assigned; order stores partner ID
              │
              ▼
Notify customer and administrator
```

Delivery-partner locations use the GeoJSON format:

```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

MongoDB uses a `2dsphere` index and the `$near` operator with a maximum distance of 10,000 metres. Partners with an active assignment are excluded before notifications are sent.

---

## Delivery-Partner Flow

1. The delivery partner logs in and opens the dashboard.
2. The browser connects to Socket.IO and emits an identity event.
3. The partner's socket ID is stored against the user account.
4. Nearby delivery requests arrive through `new-assignment` events.
5. The delivery partner accepts an available request.
6. The system associates the order and assignment with that partner.
7. The active order displays the customer, address, items, and total.
8. The browser continuously shares geographic coordinates.
9. The customer receives the latest coordinates in real time.
10. The delivery partner can chat with the customer.
11. At the destination, the partner sends an OTP to the customer.
12. Successful OTP verification completes the order and releases the partner.

---

## Real-Time Socket.IO Flow

The client creates a reusable Socket.IO connection to the standalone server.

### Client-to-Server Events

| Event | Purpose |
|---|---|
| `identity` | Associates the connected socket with a database user |
| `update-location` | Sends the delivery partner's latest latitude and longitude |
| `join-room` | Adds a customer or delivery partner to an order-specific room |
| `send-message` | Sends a chat message to an order room |

### Server-to-Client Events

| Event | Purpose |
|---|---|
| `new-order` | Updates the administrator when a customer places an order |
| `new-assignment` | Sends a delivery request to an available partner |
| `order-assigned` | Notifies interfaces that a partner accepted the order |
| `order-status-update` | Synchronizes order-status changes |
| `update-deliveryBoy-location` | Pushes live delivery coordinates to tracking clients |
| `send-message` | Delivers a chat message to members of an order room |

### HTTP-to-Socket Bridge

Next.js APIs use the Socket.IO server's `/notify` endpoint to emit an event to one socket or broadcast it to all connected clients.

```json
{
  "event": "order-status-update",
  "data": {
    "orderId": "ORDER_ID",
    "status": "out of delivery"
  },
  "socketId": "OPTIONAL_TARGET_SOCKET_ID"
}
```

---

## Live Location Tracking

1. The delivery partner's browser obtains coordinates using the browser Geolocation API.
2. The client emits `update-location` with the partner ID, latitude, and longitude.
3. The Socket.IO server converts them into a GeoJSON Point.
4. The server calls the Next.js location API to save the latest coordinates.
5. It broadcasts `update-deliveryBoy-location` to connected clients.
6. The customer tracking page verifies that the update belongs to the assigned partner.
7. React Leaflet moves the delivery marker and recenters the map.

MongoDB preserves the latest location for refreshes and proximity searches, while Socket.IO provides immediate updates to active users.

---

## Order-Specific Chat Flow

Each order ID acts as a unique Socket.IO room.

```text
Customer joins room using order ID
Delivery partner joins the same room
              │
              ▼
Previous messages loaded from MongoDB
              │
              ▼
Sender emits send-message
              │
              ▼
Socket server calls chat persistence API
              │
              ▼
Message stored in MongoDB
              │
              ▼
Message emitted only to that order room
```

Persisting messages allows both participants to recover chat history after refreshing or reconnecting.

---

## AI-Powered Reply Suggestions

The customer and delivery-partner chat interfaces include Gemini-powered quick replies.

1. SnapCart finds the latest message sent by the other participant.
2. It sends the message and current role to the AI suggestion API.
3. The backend creates a role-aware prompt.
4. Gemini generates three short, delivery-related replies.
5. The API parses the comma-separated output.
6. The interface displays three clickable suggestion chips.
7. Selecting a suggestion copies it into the chat input.

The AI feature assists communication but does not make payment, order, or delivery decisions.

---

## Stripe Payment Flow

```text
Customer selects online payment
              │
              ▼
Backend validates user and creates order
              │
              ▼
Stripe Checkout Session created
              │
              ▼
MongoDB order ID stored in Stripe metadata
              │
              ▼
Customer redirected to Stripe-hosted checkout
              │
              ▼
Stripe processes payment
              │
              ▼
Stripe sends checkout.session.completed webhook
              │
              ▼
Backend verifies Stripe signature
              │
              ▼
Order retrieved through metadata and marked paid
```

A signed webhook is used because a browser redirect alone is not reliable proof that a payment succeeded.

---

## OTP Delivery Confirmation

1. The assigned delivery partner requests an OTP.
2. The API generates a random four-digit code.
3. The code is stored against the order.
4. Nodemailer sends the code to the customer's email address.
5. The customer gives the code to the delivery partner.
6. The partner submits it through the dashboard.
7. The backend compares it with the stored order OTP.
8. Successful verification changes the order to `delivered`.
9. The delivery timestamp and verification state are saved.
10. The associated delivery assignment becomes `completed`.
11. A real-time order-status event updates connected interfaces.

---

## Database Models

### User

Stores account and delivery-partner information:

- Name and email
- Hashed password for credentials accounts
- Mobile number
- Role
- Profile image
- GeoJSON location
- Socket ID
- Online status

### Grocery

Stores product-catalogue information:

- Name
- Category
- Price
- Unit
- Cloudinary image URL
- Creation and update timestamps

### Order

Stores the complete order lifecycle:

- Customer reference
- Purchased-item snapshots
- Total amount
- Payment method and payment status
- Text address and geographic coordinates
- Delivery assignment reference
- Assigned delivery-partner reference
- Order status
- Delivery OTP and verification state
- Delivery timestamp

Order items retain product snapshots so historical orders continue showing the original name, price, image, and unit even if the catalogue changes later.

### DeliveryAssignment

Stores delivery coordination data:

- Order reference
- Partners who received the request
- Partner who accepted it
- Assignment status
- Acceptance timestamp

### Message

Stores persistent order chat:

- Order room ID
- Sender ID
- Text
- Display time
- Creation and update timestamps

---

## REST API Groups

### Authentication

- Register a credentials account
- Handle NextAuth login and OAuth callbacks
- Retrieve the current authenticated user
- Check administrator availability

### Grocery Administration

- Add grocery
- Retrieve groceries
- Edit grocery
- Delete grocery

### Order Administration

- Retrieve all orders
- Update order status
- Discover nearby delivery partners
- Broadcast delivery assignments

### Customer Orders and Payments

- Create a cash-on-delivery order
- Create an order and Stripe Checkout Session
- Process the Stripe webhook
- Retrieve the current customer's orders
- Retrieve an individual order
- Update customer role and mobile information

### Delivery

- Retrieve available assignments
- Accept an assignment
- Retrieve the current active order
- Send delivery OTP
- Verify delivery OTP

### Chat and Socket Bridge

- Store a connected socket ID
- Update delivery-partner location
- Retrieve order messages
- Save a message
- Generate AI reply suggestions

---

## State Management

Redux Toolkit contains two slices.

### User Slice

- Stores the current database user
- Initialized from the `/api/me` endpoint
- Makes user information available throughout client components

### Cart Slice

- Stores selected groceries
- Adds and removes items
- Increases and decreases quantities
- Calculates subtotal, delivery fee, and final total

Redux avoids prop drilling and keeps the navigation, grocery cards, cart, and checkout views synchronized.

---

## Important Engineering Decisions

### Separate Next.js and Socket.IO Services

The primary application and persistent real-time server have different runtime requirements. Separating them makes it possible to deploy Next.js on Vercel and maintain Socket.IO connections through a long-running Render process.

### Order ID as Chat Room ID

Using the order ID avoids introducing another room identifier and naturally isolates each delivery conversation.

### Product Snapshots Inside Orders

Copying essential product information into an order preserves historical accuracy when catalogue data changes.

### GeoJSON and 2dsphere Index

MongoDB's native geospatial support removes the need to calculate and filter every partner's distance in application code.

### Webhook-Based Payment Confirmation

Payment status is updated through server-to-server Stripe events instead of trusting the customer's browser redirect.

### Combined Persistence and Real-Time Updates

MongoDB provides durable state and history, while Socket.IO gives connected interfaces immediate updates.

---

## Technical Challenges and Solutions

### Challenge 1: Synchronizing Three Roles

**Problem:** Customers, administrators, and delivery partners must see changes without refreshing.

**Solution:** SnapCart emits targeted and broadcast Socket.IO events for new orders, assignments, status changes, and location updates.

### Challenge 2: Finding an Available Nearby Partner

**Problem:** Location alone is not sufficient because the nearest partner might already be busy.

**Solution:** A geospatial query finds partners within 10 km, and active delivery assignments are used to remove busy partners before broadcasting.

### Challenge 3: Combining Live Chat with Message History

**Problem:** Socket messages are temporary and disappear after refresh.

**Solution:** The real-time server saves each message through a Next.js API before broadcasting it to the order room.

### Challenge 4: Confirming Online Payments Reliably

**Problem:** A success-page redirect can be manipulated and does not guarantee payment completion.

**Solution:** Stripe sends a signed webhook, and the backend uses the session metadata to mark the associated order as paid.

### Challenge 5: Confirming Physical Delivery

**Problem:** A delivery partner should not complete an order without customer confirmation.

**Solution:** The customer receives a four-digit email OTP that must be verified before completing the order and assignment.

---

## Security Measures Implemented

- Password hashing with bcrypt
- JWT-based NextAuth sessions
- Google OAuth support
- Role-based page protection
- Administrator checks on product mutation APIs
- Stripe webhook-signature verification
- Server-side environment variables for sensitive credentials
- Cloudinary secure image URLs

For further production hardening, the application can add consistent API-level authorization, ownership validation, schema-based input validation, rate limiting, authenticated Socket.IO handshakes, OTP expiry and hashing, atomic assignment acceptance, and server-side price recalculation.

---

## Potential Future Improvements

- Persist the cart in local storage or the database
- Add product stock and inventory tracking
- Add order cancellation and refund workflows
- Add Stripe payment-failure cleanup
- Authenticate Socket.IO connections with session tokens
- Make delivery-assignment acceptance atomic
- Add OTP expiry, hashing, and attempt limits
- Add delivery-distance and estimated-arrival calculations
- Use Redis for socket scaling and short-lived real-time state
- Add push, SMS, and email order notifications
- Add customer reviews and delivery ratings
- Add coupons, offers, and promotional pricing
- Add automated unit, integration, and end-to-end tests
- Add structured logs, monitoring, and error tracking

---

## My Contribution

- Designed and implemented the full-stack application architecture
- Created customer, administrator, and delivery-partner interfaces
- Built the MongoDB schemas and REST APIs
- Integrated NextAuth credentials login and Google OAuth
- Implemented the Redux Toolkit cart and user state
- Integrated Stripe Checkout and webhook confirmation
- Built the standalone Express.js and Socket.IO service
- Implemented geospatial partner discovery and delivery assignment
- Developed live location tracking with Leaflet
- Built persistent order-specific chat
- Integrated Gemini contextual reply suggestions
- Implemented OTP-based delivery confirmation with Nodemailer
- Integrated Cloudinary grocery image uploads
- Configured Vercel and Render deployments

---

## Portfolio Card Description

**SnapCart** is a full-stack, real-time grocery delivery platform supporting customer, administrator, and delivery-partner workflows. It combines Next.js, TypeScript, Redux Toolkit, MongoDB, Stripe, Socket.IO, Leaflet, and Gemini to deliver product management, checkout, online payments, geospatial assignment, persistent chat, live GPS tracking, and OTP-confirmed delivery.

---

## Short Portfolio Bullets

- Built a full-stack grocery delivery platform supporting **3 role-based workflows** using Next.js, TypeScript, Redux Toolkit, and MongoDB.
- Implemented persistent order chat, real-time notifications, and live GPS tracking using **6+ Socket.IO events**.
- Developed MongoDB geospatial partner discovery within a **10 km radius** and availability-based delivery assignment.
- Integrated Stripe Checkout, signed webhooks, cash on delivery, and **4-digit OTP** delivery confirmation.
- Added Leaflet maps, OpenStreetMap reverse geocoding, Cloudinary image uploads, and Gemini-powered generation of **3 contextual replies**.

---

## Resume Version

**SnapCart | Next.js, TypeScript, MongoDB, Redux Toolkit, Express.js, Socket.IO**

- Engineered a full-stack grocery delivery platform supporting **3 role-based workflows**, real-time order notifications, and live GPS delivery tracking.
- Implemented persistent order-specific chat using **6+ custom Socket.IO events** and geospatial discovery of available delivery partners within a **10 km radius**.
- Integrated Stripe Checkout and signed webhooks for online payments, alongside cash on delivery and **4-digit OTP-based** delivery confirmation.
- Built Leaflet maps, OpenStreetMap reverse geocoding, and Gemini-powered assistance generating **3 contextual replies**, deploying Next.js on Vercel and Socket.IO on Render.

---

## Interview Introduction

> SnapCart is a full-stack, real-time grocery delivery application that I built using Next.js, TypeScript, Redux Toolkit, MongoDB, and Socket.IO. It supports three roles: customers, administrators, and delivery partners. Customers can browse products, manage their cart, select a map-based address, pay through Stripe or cash on delivery, and track their assigned delivery partner. Administrators manage products and orders, while delivery partners receive nearby assignments based on MongoDB geospatial queries. A separate Express and Socket.IO server handles real-time notifications, live GPS tracking, and order-specific chat. I also integrated Gemini-based contextual replies and four-digit OTP delivery confirmation. The Next.js application is deployed on Vercel, while the persistent Socket.IO server is hosted on Render.

---

## Project Keywords

Next.js, React, TypeScript, Node.js, Express.js, MongoDB, Mongoose, Redux Toolkit, NextAuth, Google OAuth, REST API, Socket.IO, WebSockets, Real-Time Systems, Stripe Checkout, Stripe Webhooks, Leaflet, React Leaflet, OpenStreetMap, Nominatim, GeoJSON, 2dsphere Index, Geospatial Queries, Cloudinary, Gemini API, Nodemailer, Tailwind CSS, Vercel, Render, Full-Stack Development
